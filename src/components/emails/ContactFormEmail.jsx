// src/components/emails/ContactFormEmail.jsx
import * as React from 'react';

export const ContactFormEmail = ({
  name,
  email,
  subject,
  message,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
    <h1 style={{ color: '#333', marginBottom: '24px' }}>New Contact Form Submission</h1>
    
    <div style={{ marginBottom: '16px' }}>
      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Name:</p>
      <p style={{ margin: '4px 0' }}>{name}</p>
    </div>
    
    <div style={{ marginBottom: '16px' }}>
      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Email:</p>
      <p style={{ margin: '4px 0' }}>{email}</p>
    </div>
    
    <div style={{ marginBottom: '16px' }}>
      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Subject:</p>
      <p style={{ margin: '4px 0' }}>{subject}</p>
    </div>
    
    <div style={{ marginBottom: '16px' }}>
      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Message:</p>
      <p style={{ margin: '4px 0', whiteSpace: 'pre-wrap' }}>{message}</p>
    </div>
  </div>
);