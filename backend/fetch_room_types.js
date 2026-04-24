import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const AUTH_URL = "https://192.168.11.74/authen/APIAppLogin";
const API_URL = "https://192.168.11.74/roombooking/roombooking/roomusetypecode";
const OUTPUT_DIR = "./roomusetyprcode";

// Credentials from frontend/src/services/api.js
const CREDENTIALS = {
    "username": "cm9PbUJvb2tpbmc=",
    "password": "Nzh4N297UC0kdVFB"
};

// Ensure output dir exists
try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
} catch (e) {}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const authenticate = async () => {
    try {
        console.log("Authenticating...");
        const response = await axios.post(AUTH_URL, CREDENTIALS, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.data && response.data.token) {
            console.log("✅ Authenticated. Token received.");
            return response.data.token;
        } else {
            throw new Error("No token in response");
        }
    } catch (error) {
        console.error("❌ Authentication Failed:", error.message);
        process.exit(1);
    }
};

const fetchCode = async (code, token) => {
    try {
        console.log(`Fetching code: ${code}...`);
        
        const response = await axios.get(API_URL, {
            params: {
                // roomusetypecode: code, // Trying query param
                // language: 'th'
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Assuming Bearer or just token. server.js uses raw token in 'Authorization' typically.
                // server.js sends headers: 'Authorization': authorization. It doesn't prepend 'Bearer ' in the proxy, but frontend might.
                // Frontend api.js: 'Authorization': `Bearer ${authToken}`. 
                // So I will send `Bearer ${token}`.
                // Wait, server.js:50 just passes `authorization` header from request.
                // Let's try `Bearer ${token}`.
                'Language': 'th',
                'roomusetypecode': code
            }
        });
        
        // Wait, the user said "Key is roomusetypecode ?". 
        // Previously in server.js, criteria were passed as HEADERS for room search.
        // But for this GET request, it might be query params OR headers.
        // Let's look at the error from previous run: "Missing Authorization Header".
        // Now let's Try sending query string AND header for safety or just sticking to one.
        // The user prompt: "send this api Key is roomusetypecode ? ,language = th". 
        // I'll try sending as HEADERS first because `server.js` `roomscheduleempty` used headers for criteria.
        // Re-reading user prompt: "GET {{host}}/roombooking/roombooking/roomusetypecode ... Key is roomusetypecode ?"
        // Postman {{val}} usually implies query or body.
        // I will try putting them in HEADERS as well, just in case.

        const data = response.data;
        
        if (data && data.code === 20000 && data.data && data.data.length > 0) {
            console.log(`✅ Success for ${code}: Found ${data.total} items.`);
            const filePath = path.join(OUTPUT_DIR, `${code}.json`);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        } else {
            console.log(`⚠️  No data (Code ${data.code}) for ${code}`);
            // Still save to see what happened
            // const filePath = path.join(OUTPUT_DIR, `${code}_empty.json`);
            // await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        }

    } catch (error) {
         // If GET fails, maybe try with params?
         if(error.response && error.response.status === 400) {
            // Fallback: try query params if headers fail? 
            // Or just log it.
         }
        console.error(`❌ Error fetching ${code}:`, error.message);
        if (error.response) {
             console.log('Status:', error.response.status);
             console.log('Data:', error.response.data);
        }
    }
};

const run = async () => {
    const token = await authenticate();
    // Frontend sends 'Bearer ' + token.
    // server.js expects 'Authorization' header.
    // I will try using the token.
    
    // Note: server.js line 18: axios.post `${API_HOST}/authen/APIAppLogin`.
    // response.data is returned.
    // frontend api.js line 35: `authToken = data.token`.
    // frontend api.js line 92: `'Authorization': Bearer ${authToken}`.

    for (const char of chars) {
        await fetchCode(char, token);
        await new Promise(r => setTimeout(r, 200));
    }
    console.log("Done.");
};


run();
