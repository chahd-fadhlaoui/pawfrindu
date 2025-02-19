import transporter from "../config/nodemailer.js";
import { emailTemplates } from "../utils/emailTemplates.js";

export const sendEmail = async ({ to, template, data }) => {
  try {
    const emailContent = emailTemplates[template](data);

    const mailOptions = {
      from: '"PawFrindu Team" <cherifabenghorbel03@gmail.com>',
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    //throw new Error("Failed to send email");
    return false;
  }
};
