import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
const PORT = 3000;

// TODO: Replace with Real API URL (e.g., https://api.mfu.ac.th)
// TODO: Replace with Real API URL (e.g., https://api.mfu.ac.th)
// NOTE: We strip any trailing slash to avoid double-slashes when appending paths
const API_HOST = "https://apitest.mfu.ac.th/apiroombooking".replace(/\/$/, "");

app.use(cors());
app.use(bodyParser.json());

// Authentication Endpoint Proxy
app.post('/authen/APIAppLogin', async (req, res) => {
  try {
    const response = await axios.post(`${API_HOST}/authen/APIAppLogin`, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Login Success:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: "Internal Server Error" });
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

    console.log('Proxying Room Search Request (Headers Mode)');
    console.log('Forwarding Headers:', { roomdate, timefrom, timeto, roomcapacity, language });
    console.log('Authorization Token (Partial):', authorization ? authorization.substring(0, 20) + '...' : 'None');

    const response = await axios.get(`${API_HOST}/roombooking/roombooking/roomscheduleempty`, {
      // NOTE: API requires criteria in HEADERS, not query params
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
        'Language': language || 'TH',
        // Forward the specific headers expected by the API
        ...(roomdate && { 'roomdate': roomdate }),
        ...(timefrom && { 'timefrom': timefrom }),
        ...(timeto && { 'timeto': timeto }),
        ...(roomcapacity && { 'roomcapacity': roomcapacity })
      }
    });
    console.log('Room Search Success:', response.data?.length || 'No data');
    res.json(response.data);
  } catch (error) {
    console.error('Room Search Error Status:', error.response?.status);
    console.error('Room Search Error Data:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Proxy Server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to: ${API_HOST}`);
});
