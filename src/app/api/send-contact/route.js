// src/app/api/send-contact/route.js
import { ContactFormEmail } from '@/components/emails/ContactFormEmail';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // Get form data from request
    const formData = await request.json();
    const { name, email, subject, message } = formData;
    
    // Validate form data
    if (!name || !email || !subject || !message) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
      subject: `Contact Form: ${subject}`,
      reply_to: email,
      react: ContactFormEmail({ name, email, subject, message }),
    });
    
    if (error) {
      console.error('Resend error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, data });
    
  } catch (error) {
    console.error('Server error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}