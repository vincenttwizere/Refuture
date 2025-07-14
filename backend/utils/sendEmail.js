import nodemailer from 'nodemailer';

// Email configuration
let transporter;
let emailConfig;

// Initialize email configuration
const initializeEmail = () => {
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    // Use Gmail SMTP
    emailConfig = {
      type: 'gmail',
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    };
    
    transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
    
    console.log('[sendEmail] Using Gmail SMTP');
  } else if (process.env.SENDGRID_API_KEY) {
    // Use SendGrid
    emailConfig = {
      type: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_FROM || 'no-reply@refuture.com'
    };
    
    console.log('[sendEmail] Using SendGrid');
  } else {
    console.log('[sendEmail] No email configuration found. Emails will be logged only.');
  }
};

// Initialize on module load
initializeEmail();

// HTML email templates
const emailTemplates = {
  welcome: (firstName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Welcome to Refuture!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your journey to new opportunities starts here</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName || 'there'}!</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Thank you for joining Refuture! We're excited to have you on board and help you connect with amazing opportunities.
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">What's next?</h3>
          <ul style="color: #666; line-height: 1.6;">
            <li>Complete your profile to increase your visibility</li>
            <li>Browse available opportunities</li>
            <li>Connect with organizations and providers</li>
            <li>Stay updated with new opportunities</li>
          </ul>
        </div>
        <p style="color: #666; line-height: 1.6;">
          If you have any questions, feel free to reach out to our support team.
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">Get Started</a>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
          <p>Best regards,<br>The Refuture Team</p>
        </div>
      </div>
    </div>
  `,
  
  interviewInvitation: (firstName, opportunityTitle, organizationName, interviewDate, interviewTime, location) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Interview Invitation</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">You've been invited for an interview!</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Congratulations ${firstName || 'there'}!</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          You've been invited for an interview for the following opportunity:
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Interview Details</h3>
          <p style="color: #666; margin: 5px 0;"><strong>Opportunity:</strong> ${opportunityTitle}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Organization:</strong> ${organizationName}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> ${interviewDate}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Time:</strong> ${interviewTime}</p>
          ${location ? `<p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${location}</p>` : ''}
        </div>
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="color: #155724; margin: 0; font-weight: bold;">Please confirm your attendance by responding to this email or through the platform.</p>
        </div>
        <p style="color: #666; line-height: 1.6;">
          Good luck with your interview! We're rooting for you.
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/refugee-dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">View Details</a>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
          <p>Best regards,<br>The Refuture Team</p>
        </div>
      </div>
    </div>
  `,
  
  opportunityUpdate: (firstName, opportunityTitle, updateType) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Opportunity Update</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">New update on your saved opportunity</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName || 'there'}!</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          There's been an update to an opportunity you've saved:
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">${opportunityTitle}</h3>
          <p style="color: #666; margin: 5px 0;"><strong>Update:</strong> ${updateType}</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/refugee-dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">View Details</a>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
          <p>Best regards,<br>The Refuture Team</p>
        </div>
      </div>
    </div>
  `
};

// Main email sending function
const sendEmail = async (to, subject, content, isHTML = false) => {
  try {
    if (!emailConfig) {
      console.log('[sendEmail] No email configuration. Logging email instead:');
      console.log('[sendEmail] To:', to);
      console.log('[sendEmail] Subject:', subject);
      console.log('[sendEmail] Content:', content);
      return { success: false, message: 'No email configuration found' };
    }

    if (emailConfig.type === 'gmail') {
      // Send via Gmail SMTP
      const mailOptions = {
        from: emailConfig.user,
        to,
        subject,
        ...(isHTML ? { html: content } : { text: content })
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('[sendEmail] Email sent via Gmail:', info.messageId);
      return { success: true, message: 'Email sent successfully', messageId: info.messageId };
      
    } else if (emailConfig.type === 'sendgrid') {
      // Send via SendGrid
      const sgMail = await import('@sendgrid/mail');
      sgMail.default.setApiKey(emailConfig.apiKey);
      
      const msg = {
        to,
        from: emailConfig.from,
        subject,
        ...(isHTML ? { html: content } : { text: content })
      };
      
      await sgMail.default.send(msg);
      console.log('[sendEmail] Email sent via SendGrid');
      return { success: true, message: 'Email sent successfully' };
    }
    
  } catch (error) {
    console.error('[sendEmail] Error sending email:', error);
    return { success: false, message: 'Failed to send email', error: error.message };
  }
};

// Convenience functions for specific email types
const sendWelcomeEmail = async (email, firstName) => {
  const htmlContent = emailTemplates.welcome(firstName);
  return await sendEmail(email, 'Welcome to Refuture!', htmlContent, true);
};

const sendInterviewInvitation = async (email, firstName, opportunityTitle, organizationName, interviewDate, interviewTime, location = null) => {
  const htmlContent = emailTemplates.interviewInvitation(firstName, opportunityTitle, organizationName, interviewDate, interviewTime, location);
  return await sendEmail(email, `Interview Invitation - ${opportunityTitle}`, htmlContent, true);
};

const sendOpportunityUpdate = async (email, firstName, opportunityTitle, updateType) => {
  const htmlContent = emailTemplates.opportunityUpdate(firstName, opportunityTitle, updateType);
  return await sendEmail(email, `Opportunity Update - ${opportunityTitle}`, htmlContent, true);
};

export default sendEmail;
export { sendWelcomeEmail, sendInterviewInvitation, sendOpportunityUpdate }; 