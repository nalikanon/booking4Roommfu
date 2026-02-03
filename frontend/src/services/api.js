
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
      // Convert criteria to API format
      const apiCriteria = { ...criteria };

      // Format Date: YYYY-MM-DD -> MM/DD/YYYY
      if (apiCriteria.roomdate) {
        const [year, month, day] = apiCriteria.roomdate.split('-');
        apiCriteria.roomdate = `${month}/${day}/${year}`;
      }

      // Format Time: HH:mm -> HHMM
      if (apiCriteria.timefrom) {
        apiCriteria.timefrom = apiCriteria.timefrom.replace(':', '');
      }
      if (apiCriteria.timeto) {
        apiCriteria.timeto = apiCriteria.timeto.replace(':', '');
      }

      // Ensure language param exists (per user request, though header is also set)
      if (!apiCriteria.language) {
        apiCriteria.language = 'th';
      }

      // Send criteria as Headers (not Query Strings)
      const url = `${BASE_URL}/roombooking/roombooking/roomscheduleempty`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'Language': apiCriteria.language,
          // Custom Headers for Room Search
          ...(apiCriteria.roomdate && { 'roomdate': apiCriteria.roomdate }),
          ...(apiCriteria.timefrom && { 'timefrom': apiCriteria.timefrom }),
          ...(apiCriteria.timeto && { 'timeto': apiCriteria.timeto }),
          ...(apiCriteria.roomcapacity && { 'roomcapacity': apiCriteria.roomcapacity })
        }
      });

      const data = await response.json();
      console.log('API Response Status:', response.status);
      console.log('API Response Body:', data);

      if (response.ok) {
        return data;
      } else {
        // Handle Token Errors (401 or specific "Not enough segments" error)
        const isTokenError = response.status === 401 || (data && data.msg === 'Not enough segments');

        if (isTokenError) {
          console.warn('Invalid or expired token, retrying auth...');
          authToken = null;
          localStorage.removeItem('app_token'); // Clear stored token

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
  },

  async bookRoom(bookingData) {
    // Ensure we have a token
    if (!authToken) {
      const success = await this.authenticate();
      if (!success) return { success: false, message: 'Authentication failed' };
    }

    console.log('------------------------------------------');
    console.log('API Request: [POST] /roombooking/roombooking/roombookingins');
    console.log('Payload:', bookingData);

    try {
      const url = `${BASE_URL}/roombooking/roombooking/roombookingins`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      console.log('API Response Status:', response.status);
      console.log('API Response Body:', data);

      if (response.ok) {
        return { success: true, data };
      } else {
        // Handle Token Errors
        if (response.status === 401) {
          console.warn('Invalid or expired token, retrying auth...');
          authToken = null;
          localStorage.removeItem('app_token'); 
          
          const reAuth = await this.authenticate();
          if (reAuth) {
            return this.bookRoom(bookingData);
          }
        }
        return { success: false, message: data.message || 'Booking failed' };
      }
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: error.message };
    }
  },
  
  async getBookingHistory(officerId = "57360003") {
    // Ensure we have a token
    if (!authToken) {
      const success = await this.authenticate();
      if (!success) return [];
    }

    console.log('------------------------------------------');
    console.log('API Request: [GET] /roombooking/roombooking/roombookinghistory');

    try {
      const url = `${BASE_URL}/roombooking/roombooking/roombookinghistory`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'officerid': officerId,
            'Language': 'th'
        }
      });

      const data = await response.json();
      console.log('API Response Status:', response.status);
      console.log('API Response Body:', data);

      if (response.ok) {
        return data;
      } else {
         // Handle Token Errors
         if (response.status === 401) {
          console.warn('Invalid or expired token, retrying auth...');
          authToken = null;
          localStorage.removeItem('app_token'); 
          
          const reAuth = await this.authenticate();
          if (reAuth) {
            return this.getBookingHistory(officerId);
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
