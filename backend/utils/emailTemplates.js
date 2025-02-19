const emailStyles = `
<style>
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  .button {
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
  }
  .footer {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    font-size: 12px;
    color: #666;
  }
</style>
`;
export const emailTemplates = {
    welcome: (fullName) => ({
      subject: "Welcome to PawFrindu!",
      html: `
        ${emailStyles}
        <div class="email-container">
          <h1>Welcome to PawFrindu, ${fullName}! 🐾</h1>
          <p>Thank you for joining our community. We're excited to have you on board!</p>
          <p>To get started:</p>
          <ol>
            <li>Complete your profile</li>
            <li>Browse available services</li>
            <li>Connect with pet professionals</li>
          </ol>
          <a href="${process.env.FRONTEND_URL}/profile" class="button">Complete Your Profile</a>
          <div class="footer">
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The PawFrindu Team</p>
          </div>
        </div>
      `,
    }),
  
    passwordReset: (resetData) => ({
      subject: "Reset Your PawFrindu Password",
      html: `
        ${emailStyles}
        <div class="email-container">
          <h1>Password Reset Request 🔑</h1>
          <p>Hello ${resetData.fullName},</p>
          <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          <p>To reset your password, click the button below:</p>
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetData.resetToken}" class="button">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour for security reasons.
          </p>
          <p>Or copy and paste this URL into your browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">
            ${process.env.FRONTEND_URL}/reset-password?token=${resetData.resetToken}
          </p>
          <div class="footer">
            <p>If you didn't request this password reset, please:</p>
            <ol>
              <li>Ignore this email</li>
              <li>Ensure your account is secure</li>
              <li>Contact support if you're concerned</li>
            </ol>
            <p>Best regards,<br>The PawFrindu Team</p>
          </div>
        </div>
      `,
    }),
  };