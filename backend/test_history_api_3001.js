import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testHistory() {
  try {
    // 1. Authenticate to get token
    console.log('Authenticating...');
    const authResponse = await axios.post(`${BASE_URL}/authen/APIAppLogin`, {
      username: "Um9vbUJvb2tpbmc=",
      password: "RDBoWjZfNnpydEN3"
    });

    const token = authResponse.data.token || authResponse.data.access_token || authResponse.data;
    console.log('Token acquired:', token ? 'Yes' : 'No');

    if (!token) {
        console.error("Failed to get token");
        return;
    }

    // 2. Fetch History
    console.log('Fetching History...');
    const historyResponse = await axios.get(`${BASE_URL}/roombooking/roombooking/roombookinghistory`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'officerid': '57360003',
        'Language': 'th'
      }
    });

    console.log('Status:', historyResponse.status);
    console.log('Data Items:', Array.isArray(historyResponse.data) ? historyResponse.data.length : 'Not Array');
    if (Array.isArray(historyResponse.data) && historyResponse.data.length > 0) {
        console.log('First Item:', JSON.stringify(historyResponse.data[0], null, 2));
    } else {
        console.log('Data Type:', typeof historyResponse.data);
        console.log('Object Keys:', JSON.stringify(Object.keys(historyResponse.data)));
        if (historyResponse.data.data && Array.isArray(historyResponse.data.data)) {
             console.log('Found array in .data property!');
             console.log('Array Length:', historyResponse.data.data.length);
        }
    }

  } catch (error) {
    console.error('Error:', error.response ? error.response.status : error.message);
    if (error.response) {
        console.error('Data:', error.response.data);
    }
  }
}

testHistory();
