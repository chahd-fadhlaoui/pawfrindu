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
  profileApproved: (data) => ({
    subject: "Your PawFrindu Profile is Approved!",
    html: `
        ${emailStyles}
        <div class="email-container">
          <h1>Congratulations, ${data.fullName}! 🎉</h1>
          <p>Your profile has been approved and is now active on PawFrindu.</p>
          <a href="${process.env.FRONTEND_URL}/login" class="button">Log In Now</a>
          <div class="footer">
            <p>Welcome aboard!<br>The PawFrindu Team</p>
          </div>
        </div>
      `,
  }),
  petRejected: (data) => ({
    subject: "Your Pet Listing Has Been Rejected",
    html: `
        ${emailStyles}
        <div class="email-container">
          <h1>Pet Listing Rejected</h1>
          <p>Hello ${data.ownerFullName},</p>
          <p>We regret to inform you that your pet listing for <strong>${data.petName}</strong> has been rejected by our team.</p>
          <p>This could be due to incomplete information, policy violations, or other reasons. For more details, please contact our support team.</p>
          <a href="${process.env.FRONTEND_URL}/support" class="button" style="background-color: #f44336;">Contact Support</a>
          <div class="footer">
            <p>We apologize for any inconvenience this may cause.</p>
            <p>Best regards,<br>The PawFrindu Team</p>
          </div>
        </div>
      `,
  }),
  profileRejected: (data) => ({
    subject: "Your PawFrindu Profile Has Been Rejected",
    html: `
        ${emailStyles}
        <div class="email-container">
          <h1>Profile Rejection Notice</h1>
          <p>Hello ${data.fullName},</p>
          <p>We regret to inform you that your profile has been rejected by our team and your account has been deleted.</p>
          <p>This could be due to incomplete information, policy violations, or other reasons. For more details, please contact our support team.</p>
          <a href="${process.env.FRONTEND_URL}/support" class="button" style="background-color: #f44336;">Contact Support</a>
          <div class="footer">
            <p>We apologize for any inconvenience this may cause.</p>
            <p>Best regards,<br>The PawFrindu Team</p>
          </div>
        </div>
      `,
  }),
  petSoldToFormerOwner: (data) => ({
    subject: `Your Pet ${data.petName} Has Been Sold`,
    html: `
        ${emailStyles}
        <div class="email-container">
          <h1>Your Pet ${data.petName} Has Been Sold 🐾</h1>
          <p>Hello ${data.formerOwnerFullName},</p>
          <p>We are pleased to inform you that your pet <strong>${data.petName}</strong> has been successfully sold to a new owner.</p>
          <p>Please contact the new owner to coordinate any necessary details:</p>
          <ul>
            <li><strong>Name:</strong> ${data.newOwnerFullName}</li>
            <li><strong>Email:</strong> ${data.newOwnerEmail}</li>
            <li><strong>Phone:</strong> ${data.newOwnerPhone || "Not provided"}</li>
          </ul>
          <a href="mailto:${data.newOwnerEmail}" class="button" style="background-color: #4CAF50;">Contact New Owner</a>
          <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>The PawFrindu Team</p>
          </div>
        </div>
      `,
  }),

  petPurchaseToNewOwner: (data) => ({
    subject: `Congratulations on Your New Pet ${data.petName}!`,
    html: `
        ${emailStyles}
        <div class="email-container">
          <h1>Congratulations, ${data.newOwnerFullName}! 🎉</h1>
          <p>You have successfully purchased <strong>${data.petName}</strong>! Welcome to your new furry friend!</p>
          <p>The former owner should contact you soon to coordinate any details. If they haven't reached out, you can contact them using the information below:</p>
          <ul>
            <li><strong>Name:</strong> ${data.formerOwnerFullName}</li>
            <li><strong>Email:</strong> ${data.formerOwnerEmail}</li>
            <li><strong>Phone:</strong> ${data.formerOwnerPhone || "Not provided"}</li>
          </ul>
          <a href="mailto:${data.formerOwnerEmail}" class="button" style="background-color: #4CAF50;">Contact Former Owner</a>
          <div class="footer">
            <p>We wish you and ${data.petName} many happy moments together!</p>
            <p>Best regards,<br>The PawFrindu Team</p>
          </div>
        </div>
      `,
  }),
reportMatched: (data) => ({
    subject: "Your Lost and Found Report Has Been Matched!",
    html: `
        ${emailStyles}
        <div class="email-container">
          <h1>Your Report Has Been Matched! 🐾</h1>
          <p>Hello ${data.fullName || "User"},</p>
          <p>We are excited to inform you that your ${data.reportType} report${data.petName ? ` for <strong>${data.petName}</strong>` : ""} has been matched with a corresponding report!</p>
          <p>Please contact the other party to coordinate further details:</p>
          <ul>
            <li><strong>Name:</strong> ${data.matchedUserFullName || "Anonymous User"}</li>
            <li><strong>Email:</strong> ${data.matchedUserEmail}</li>
            <li><strong>Phone:</strong> ${data.matchedUserPhone || "Not provided"}</li>
          </ul>
          <a href="mailto:${data.matchedUserEmail}" class="button" style="background-color: #4CAF50;">Contact Other Party</a>
          <p>You can also view the matched report details in your PawFrindu account.</p>
          <a href="${process.env.FRONTEND_URL}/reports" class="button" style="background-color: #2196F3;">View Report</a>
          <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>The PawFrindu Team</p>
          </div>
        </div>
      `,
  }),

  reportUnmatched: (data) => ({
    subject: "Your Lost and Found Report Has Been Unmatched",
    html: `
        ${emailStyles}
        <div class="email-container">
          <h1>Your Report Has Been Unmatched</h1>
          <p>Hello ${data.fullName || "User"},</p>
          <p>We regret to inform you that your ${data.reportType} report${data.petName ? ` for <strong>${data.petName}</strong>` : ""} has been unmatched by our team.</p>
          <p>This could be due to new information or an error in the initial match. Your report is now back in Pending status.</p>
          <p>You can view your report details in your PawFrindu account.</p>
          <a href="${process.env.FRONTEND_URL}/reports" class="button" style="background-color: #2196F3;">View Report</a>
          <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>The PawFrindu Team</p>
          </div>
        </div>
      `,
  }),

};