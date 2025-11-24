import io from 'socket.io-client';

// In development, use localhost:3001. In production (same origin), use undefined to let socket.io auto-detect.
const URL = import.meta.env.DEV ? 'http://localhost:3001' : undefined;

export const socket = io(URL);
