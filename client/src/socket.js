import io from 'socket.io-client';

// Connect to the server (assuming it runs on port 3001 locally)
// In production, this would be the deployed URL
const URL = 'http://localhost:3001';

export const socket = io(URL);
