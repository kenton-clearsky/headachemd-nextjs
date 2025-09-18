// Re-export from the new client configuration
export { auth, db, storage, functions } from './client';
export { default as app } from './client';

// Configuration is now handled in client.ts and admin.ts
