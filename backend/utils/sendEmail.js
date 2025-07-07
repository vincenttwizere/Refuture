// Email utility function - placeholder for future email functionality
import sgMail from 'nodemailer'; // placeholder, will replace with @sendgrid/mail

// Replace nodemailer with SendGrid
let sendEmail;

if (process.env.SENDGRID_API_KEY) {
  // Use SendGrid
  import('@sendgrid/mail').then(sgMail => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sendEmail = async (to, subject, content) => {
      try {
        console.log('[sendEmail] Using SendGrid');
        const msg = {
          to,
          from: process.env.SENDGRID_FROM || 'no-reply@refuture.com',
          subject,
          text: content,
        };
        await sgMail.send(msg);
        return { success: true, message: 'Email sent successfully' };
      } catch (error) {
        console.error('[sendEmail] Error sending email with SendGrid:', error);
        return { success: false, message: 'Failed to send email' };
      }
    };
  });
} else {
  // Fallback: log only
  sendEmail = async (to, subject, content) => {
    console.log('[sendEmail] SENDGRID_API_KEY not set. Email not sent.');
    console.log('[sendEmail] To:', to);
    console.log('[sendEmail] Subject:', subject);
    console.log('[sendEmail] Content:', content);
    return { success: false, message: 'SENDGRID_API_KEY not set' };
  };
}

export default sendEmail; 