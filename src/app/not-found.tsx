'use client';

import { config } from '@/lib/config';

export default function NotFound() {
  return (
    <main style={{ minHeight: '70vh', background: '#F4F8E9', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px', textAlign: 'center' }}>
        <h1 style={{ color: '#3A4523', marginBottom: 8 }}>404 - Page Not Found</h1>
        <p style={{ color: '#47542B', marginBottom: 24 }}>
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            background: '#a5c422',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Go back home
        </a>
      </div>
    </main>
  );
}
