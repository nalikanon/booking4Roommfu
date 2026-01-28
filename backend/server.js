
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Authentication Endpoint
app.post('/authen/APIAppLogin', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login Request:', { username, password });

  if (username === "Um9vbUJvb2tpbmc=" && password === "RDBoWjZfNnpydEN3") {
    res.json({
      token: "mock-jwt-token-xyz-123",
      message: "Login Successful"
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Room Search Endpoint
app.get('/roombooking/roombooking/roomscheduleempty', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  // console.log('Room Search Params:', req.query);
  // Always return the mock response data as requested
  res.json(mockResponseData);
});

app.listen(PORT, () => {
  console.log(`Mock Backend Server running on http://localhost:${PORT}`);
});
