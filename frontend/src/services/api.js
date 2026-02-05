
// src/services/api.js
import { ref } from 'vue';

const BASE_URL = '/api'; // We will configure proxy in vite.config.js

// Token is set during OAuth callback
let authToken = localStorage.getItem('access_token') || null;

export const api = {
  // authenticate() function removed as we use OAuth now


  async getEmptyRooms(criteria = {}) {
    // Ensure we have a token
    if (!authToken) {
       console.warn('No token found');
       return [];
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
        // Handle Token Errors (401)
        if (response.status === 401) {
           console.warn('Invalid or expired token. Redirecting to login...');
           localStorage.removeItem('access_token');
           window.location.href = '/'; // Redirect to login
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
      return { success: false, message: 'Authentication required' };
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
        if (response.status === 401) {
           localStorage.removeItem('access_token');
           window.location.href = '/';
        }
        return { success: false, message: data.message || 'Booking failed' };
      }
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: error.message };
    }
  },
  
  async getBookingHistory(officerId = "57360003") {
    if (!authToken) { // OAuth token check
       return [];
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
         if (response.status === 401) {
           localStorage.removeItem('access_token');
           window.location.href = '/';
        }
        return [];
      }
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  }
};
