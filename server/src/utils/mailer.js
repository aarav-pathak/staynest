import nodemailer from 'nodemailer';
import { getBookingRequestTemplate } from '../templates/bookingRequest.js';
import { getBookingStatusTemplate } from '../templates/bookingStatus.js';

let transporterPromise = null;

const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development/test fallback: Use Ethereal test account
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('[Mailer] Using Ethereal test email account:', testAccount.user);
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn('[Mailer] Could not create test email account, using mock transport:', err.message);
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }
};

const getTransporter = () => {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
};

/**
 * Low-level send helper with error insulation.
 * Will not throw or disrupt caller if email dispatch fails.
 */
export const sendMail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || '"StayNest" <no-reply@staynest.dev>';

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Mailer] Preview URL for "${subject}" (${to}): ${previewUrl}`);
    } else {
      console.log(`[Mailer] Email sent to ${to}: ${info.messageId || 'OK'}`);
    }
    return info;
  } catch (err) {
    console.error(`[Mailer] Failed to send email to ${to}:`, err.message);
    return null;
  }
};

/**
 * Notify host of a new booking request.
 */
export const sendBookingRequestToHost = async ({ host, guest, listing, booking }) => {
  if (!host?.email) return;
  const { subject, html, text } = getBookingRequestTemplate({
    host,
    guest,
    listing,
    booking,
    clientUrl: process.env.CLIENT_URL,
  });

  return sendMail({
    to: host.email,
    subject,
    html,
    text,
  });
};

/**
 * Notify guest when booking status changes to confirmed or declined (cancelled).
 */
export const sendBookingStatusToGuest = async ({ guest, listing, booking, status }) => {
  if (!guest?.email) return;
  const { subject, html, text } = getBookingStatusTemplate({
    guest,
    listing,
    booking,
    status,
    clientUrl: process.env.CLIENT_URL,
  });

  return sendMail({
    to: guest.email,
    subject,
    html,
    text,
  });
};
