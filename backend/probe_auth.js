import 'dotenv/config';
import axios from 'axios';
import https from 'https';
import fs from 'fs';

const DEFAULT_HOSTS = [
    "https://roombooking.mfu.ac.th/apiroombooking",
    "https://roombooking.mfu.ac.th/api",
    "https://roombooking.mfu.ac.th",
    "https://192.168.11.74"
];

const HOSTS = process.env.API_HOSTS
    ? process.env.API_HOSTS.split(",").map(h => h.trim())
    : DEFAULT_HOSTS;

const CREDENTIALS = {
    username: "Um9vbUJvb2tpbmc=",
    password: "RDBoWjZfNnpydEN3"
};

function log(msg) {
    console.log(msg);
    fs.appendFileSync('backend/probe_result.txt', msg + '\n');
}

async function testAuth() {
    fs.writeFileSync('backend/probe_result.txt', 'START PROBE\n');
    log("🔍 Probing Auth Endpoints...");
    
    for (const host of HOSTS) {
        const url = `${host}/authen/APIAppLogin`;
        log(`\nTesting: ${url}`);
        try {
            const response = await axios.post(url, CREDENTIALS, {
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                timeout: 5000
            });
            log(`✅ SUCCESS! Status: ${response.status}`);
            log(`   Token: ${response.data.token ? 'YES' : 'NO'}`);
            // Found it!
        } catch (error) {
            log(`❌ Failed: ${error.response ? error.response.status : error.message}`);
            if (error.response && error.response.status === 405) {
                log("   (Method Not Allowed - Likely wrong path)");
            }
        }
    }
}

testAuth();
