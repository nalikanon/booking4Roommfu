import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
const PORT = 3000;

// NOTE: We strip any trailing slash to avoid double-slashes when appending paths
const API_HOST = (process.env.API_HOST || "https://roombooking.mfu.ac.th/api/").replace(/\/$/, "");

app.use(cors());
app.use(bodyParser.json());

// Authentication Endpoint Proxy

// OAuth2 Token Exchange
const OAUTH_TOKEN_URL = process.env.OAUTH_TOKEN_URL || 'https://authsso.mfu.ac.th/adfs/oauth2/token';
const CLIENT_ID = process.env.CLIENT_ID || 'c4f25000-ccac-4320-8ccf-2c4cb742f04c';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'eM3IqlafXcISqaWpyGV_KfWJm8_HFmyKGZF9hOwr';
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://roombooking.mfu.ac.th/auth/callback';

app.post('/authen/exchange', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ message: 'Authorization code is required' });
        }

        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', CLIENT_ID);
        params.append('client_secret', CLIENT_SECRET);
        params.append('code', code);
        params.append('redirect_uri', REDIRECT_URI);

        console.log('Exchanging code for token...');
        
        const response = await axios.post(OAUTH_TOKEN_URL, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Token Exchange Success');
        console.log('📦 [DEBUG] Login Response Data:', JSON.stringify(response.data, null, 2));
        // Return the full response from MFU SSO (access_token, id_token, etc.)
        res.json(response.data);

    } catch (error) {
        console.error('Token Exchange Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Token Exchange Failed" });
    }
});

// Room Search Endpoint Proxy
app.get('/roombooking/roombooking/roomscheduleempty', async (req, res) => {
  try {
    // Extract custom headers from the incoming request
    // User's Postman reference shows these are sent as Headers, not Query Params
    const {
      authorization,
      roomdate,
      timefrom,
      timeto,
      roomcapacity,
      language
    } = req.headers;

    console.log('\n🔍 [PROXY] Room Search Request');
    console.log(`🔗 [PROXY] Upstream URL: ${API_HOST}/roombooking/roombooking/roomscheduleempty`);
    console.log('📋 Forwarding Headers:', {
        'roomdate': roomdate,
        'timefrom': timefrom,
        'timeto': timeto,
        'roomcapacity': roomcapacity,
        'language': language
    });

    const response = await axios.get(`${API_HOST}/roombooking/roombooking/roomscheduleempty`, {
      // NOTE: API requires criteria in HEADERS, not query params
      headers: {
        'Authorization': sanitizedAuth,
        'Content-Type': 'application/json',
        'Language': language || 'TH',
        // Forward the specific headers expected by the API
        ...(roomdate && { 'roomdate': roomdate }),
        ...(timefrom && { 'timefrom': timefrom }),
        ...(timeto && { 'timeto': timeto }),
        ...(roomcapacity && { 'roomcapacity': roomcapacity })
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('❌ [PROXY] Search Error Status:', error.response?.status);
    console.error('❌ [PROXY] Search Error Data:', JSON.stringify(error.response?.data, null, 2));
    res.status(error.response?.status || 500).json(error.response?.data || { message: "Internal Server Error" });
  }
});

// Room Booking Endpoint Proxy
app.post('/roombooking/roombooking/roombookingins', async (req, res) => {
  try {
    const { authorization, language } = req.headers;
    const bookingData = req.body;

    console.log('\n\n==================================================');
    console.log('🔔 [BACKEND] RECEIVED BOOKING REQUEST (POST /roombooking/roombooking/roombookingins)');
    console.log('==================================================');
    console.log('📦 Payload:', JSON.stringify(bookingData, null, 2));
    
    // Check if token exists
    if (!authorization) {
        console.warn('⚠️  Warning: No Authorization Header provided!');
    } else {
        console.log('🔑 Authorization Token Provided');
    }

    const response = await axios.post(`${API_HOST}/roombooking/roombooking/roombookingins`, bookingData, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
        'Language': language || 'th'
      }
    });

    console.log('✅ [BACKEND] BOOKING API RESPONSE SUCCESS:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('==================================================\n');
    
    res.json(response.data);
  } catch (error) {
    console.error('\n❌ [BACKEND] BOOKING API ERROR:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data || error.message, null, 2));
    console.error('==================================================\n');
    res.status(error.response?.status || 500).json(error.response?.data || { message: "Internal Server Error" });
  }
});

// Room Booking History Endpoint Proxy
app.get('/roombooking/roombooking/roombookinghistory', async (req, res) => {
  try {
    const { authorization, language, officerid } = req.headers;

    console.log('Proxying Room Booking History Request');
    console.log('Officer ID:', officerid);
    
    // Check missing headers
    if (!officerid) {
        console.warn('⚠️ Warning: No Officer ID provided!');
    }

    const response = await axios.get(`${API_HOST}/roombooking/roombooking/roombookinghistory`, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
        'Language': language || 'TH',
        'officerid': officerid
      }
    });

    console.log('History Success:', response.data?.length ? `${response.data.length} items` : 'No items');
    res.json(response.data);
  } catch (error) {
    console.error('History Query Error Status:', error.response?.status);
    console.error('History Query Error Data:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Proxy Server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to: ${API_HOST}`);
});
