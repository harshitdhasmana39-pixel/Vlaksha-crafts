import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
  console.log('Testing SMTP connection...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // 587 is false
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Vlaksha Crafts <noreply@vlakshacrafts.com>',
      to: process.env.SMTP_USER, // Send a test email to themselves
      subject: '✨ Vlaksha Crafts - Local SMTP Test Successful!',
      text: 'If you are reading this, your SMTP settings in the .env file are working perfectly! You can now copy these to Netlify.',
      html: '<h3>Success!</h3><p>Your local SMTP settings are working perfectly. You can safely add them to Netlify now.</p>'
    });
    
    console.log('Success! Test email sent.');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Failed to send test email:', error);
  }
}

testEmail();
