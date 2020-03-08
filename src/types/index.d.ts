import fetch from 'node-fetch';
declare global {
  interface RequestInit {
    rejectUnauthorized?: boolean; // New parameter
  }
}
