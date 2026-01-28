
// src/services/api.js
import { ref } from 'vue';

const BASE_URL = '/api'; // We will configure proxy in vite.config.js

let authToken = localStorage.getItem('app_token') || null;

export const api = {
  async authenticate() {
    console.log('------------------------------------------');
    console.log('API Request: [POST] /authen/APIAppLogin');
    console.log('Payload:', { username: "Um9vbUJvb2tpbmc=", password: "***" });
    
    try {
      const response = await fetch(`${BASE_URL}/authen/APIAppLogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "username": "Um9vbUJvb2tpbmc=",
          "password": "RDBoWjZfNnpydEN3"
        })
      });

      const data = await response.json();
      console.log('API Response Status:', response.status);
      console.log('API Response Body:', data);
      
      if (response.ok) {
        // Assuming the token is in 'token' or similar. 
        // If the user hasn't specified the response structure, we'll try to guess or just store the whole thing if needed.
        // Common pattern: data.access_token or data.token
        authToken = data.token || data.access_token || data; 
        // If data itself is the token or complex object, we might need adjustment.
        // For now, let's assume `data.token` or just use `data` if it looks like a string.
        if (typeof data === 'string') authToken = data;
        
        localStorage.setItem('app_token', authToken);
        return true;
      } else {
        console.error('Authentication Failed');
        return false;
      }
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  async getEmptyRooms(criteria = {}) {
    // Ensure we have a token
    if (!authToken) {
      const success = await this.authenticate();
      if (!success) return [];
    }

    console.log('------------------------------------------');
    console.log('API Request: [POST] /roombooking/roombooking/roomscheduleempty');
    
    try {
      // Convert criteria to query string
      const queryParams = new URLSearchParams(criteria).toString();
      const url = `${BASE_URL}/roombooking/roombooking/roomscheduleempty${queryParams ? '?' + queryParams : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      console.log('API Response Status:', response.status);
      console.log('API Response Body:', data);
      
      if (response.ok) {
        return data;
      } else {
        // If 401, maybe retry auth?
        if (response.status === 401) {
            console.warn('Token expired, retrying auth...');
            authToken = null;
            const reAuth = await this.authenticate();
            if (reAuth) {
                return this.getEmptyRooms(criteria);
            }
        }
        return [];
      }
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  }
};
