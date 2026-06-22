const nodemailer = require('nodemailer');

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  const email = process.env.EMAIL_USER || process.env.SMTP_EMAIL;
  const password = process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;

  if (email && password) {
    transporter = nodemailer.createTransport({
      // REMOVED: service: 'gmail',
      // ADDED: Explicit host, port, and secure settings for Render
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false // Helps prevent cloud certificate handshake timeouts
      }
    });
    console.log('Nodemailer initialized with EMAIL_USER on secure port 465');
  } else {
    // Ethereal Mock Email for testing
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Nodemailer initialized with Ethereal Mock Account');
  }

  return transporter;
};

/**
 * Send email with PDF attachment
 */
const sendBillEmail = async (toEmail, billNumber, pdfBuffer, userName = '') => {
  try {
    const tp = await getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.SMTP_EMAIL || '"LuxeStore" <no-reply@store.com>',
      to: toEmail,
      subject: `Your Invoice for Order ${billNumber}`,
      text: `Hello ${userName},\n\nThank you for your order. Please find attached the invoice for your order ${billNumber}.\n\nBest Regards,\nLuxeStore`,
      attachments: [
        {
          filename: `${billNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await tp.sendMail(mailOptions);

    if (!process.env.EMAIL_USER && !process.env.SMTP_EMAIL) {
      console.log(`[MOCK EMAIL] Preview URL: %s`, nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send inquiry email to admin
 */
const sendInquiryEmail = async (name, email, phone, message) => {
  try {
    const tp = await getTransporter();

    // Send to the admin's own email (the one configured in env)
    const adminEmail = process.env.EMAIL_USER || process.env.SMTP_EMAIL;

    if (!adminEmail) {
      console.warn("No EMAIL_USER configured. Inquiry will not be sent to real email.");
    }

    const mailOptions = {
      from: `"${name}" <no-reply@store.com>`, // Display customer name
      replyTo: email, // If admin clicks "Reply", it goes to customer
      to: adminEmail || 'admin@mockstore.com',
      subject: `New Store Inquiry from ${name}`,
      text: `You have received a new inquiry from your Storefront.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`,
    };

    const info = await tp.sendMail(mailOptions);

    if (!adminEmail) {
      console.log(`[MOCK INQUIRY EMAIL] Preview URL: %s`, nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending inquiry email:', error);
    throw error;
  }
};
/**
 * Generic sendEmail function
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const tp = await getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.SMTP_EMAIL || '"LuxeStore" <no-reply@store.com>',
      to,
      subject,
      text,
      html,
    };

    const info = await tp.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending generic email:', error);
    throw error;
  }
};

module.exports = { sendBillEmail, sendInquiryEmail, sendEmail };
