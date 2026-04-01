const transporter = require('../config/email');
const { formatCurrency } = require('../utils/helpers');
const { queueEmail } = require('./emailQueueService');
const logger = require('../utils/logger');
const Settings = require('../models/Settings');

/**
 * Helper to get template from Settings and replace placeholders
 * @param {string} key - Settings key
 * @param {object} data - Placeholder data
 * @param {object} defaults - Default subject and html
 */
const getTemplate = async (key, data, defaults) => {
  try {
    const [setting, logoSetting] = await Promise.all([
      Settings.findOne({ key }),
      Settings.findOne({ key: 'email.logo_url' })
    ]);

    let subject = defaults.subject;
    let html = defaults.html;
    const logoUrl = logoSetting?.value || '';
    const logoDisplay = logoUrl ? 'block' : 'none';

    if (setting && setting.value) {
      if (setting.value.subject) subject = setting.value.subject;
      if (setting.value.html) html = setting.value.html;
    }

    // Merge placeholders into data
    const replacementData = { ...data, logoUrl, logoDisplay };

    // Replace placeholders: {{key}} -> replacementData[key]
    Object.entries(replacementData).forEach(([k, v]) => {
      const regex = new RegExp(`{{${k}}}`, 'g');
      html = html.replace(regex, v);
      subject = subject.replace(regex, v);
    });

    return { subject, html };
  } catch (error) {
    logger.error(`Error fetching template ${key}:`, error);
    return defaults;
  }
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, name, code) => {
  const defaults = {
    subject: 'Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{logoUrl}}" alt="Logo" style="max-height: 50px; margin-bottom: 10px; display: {{logoDisplay}};" />
            <h1>Welcome to Gaming Store!</h1>
          </div>
          <div class="content">
            <p>Hi {{name}},</p>
            <p>Thank you for signing up! Please verify your email address using the code below:</p>
            <div class="code">{{code}}</div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Gaming Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  const { subject, html } = await getTemplate('email.template.verification', { name, code }, defaults);

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: email,
    replyTo: process.env.EMAIL_FROM, // Helps avoid being seen as spoofed
    headers: {
      'X-Entity-Ref-ID': Date.now().toString() // Helps some providers track related emails
    },
    subject,
    html
  };

  try {
    // Wrap sendMail in a promise with a 5-second timeout
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timed out after 5 seconds')), 5000))
    ]);

    logger.info('Verification email sent successfully', { 
      to: email, 
      messageId: info.messageId,
      response: info.response 
    });

    await queueEmail({
      to: email,
      subject: mailOptions.subject,
      html: mailOptions.html,
      emailType: 'verification',
      status: 'sent',
      sentAt: new Date()
    });
  } catch (error) {
    logger.error('CRITICAL: Failed to send verification email directly', { 
      email, 
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      stack: error.stack
    });
    await queueEmail({
      to: email,
      subject: mailOptions.subject,
      html: mailOptions.html,
      emailType: 'verification',
      status: 'pending'
    });
  }
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (email, name, order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.price)}</td>
      </tr>
    `
    )
    .join('');

  const defaults = {
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          table { width: 100%; border-collapse: collapse; background: white; margin: 20px 0; }
          th { background: #667eea; color: white; padding: 10px; text-align: left; }
          .total { font-size: 18px; font-weight: bold; text-align: right; padding: 20px; background: white; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{logoUrl}}" alt="Logo" style="max-height: 50px; margin-bottom: 10px; display: {{logoDisplay}};" />
            <h1>Order Confirmed!</h1>
            <p>Order #{{orderNumber}}</p>
          </div>
          <div class="content">
            <p>Hi {{name}},</p>
            <p>Thank you for your order! We've received your order and it's being processed.</p>
            
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                {{itemsHtml}}
              </tbody>
            </table>
            
            <div class="total">
              <p>Subtotal: {{subtotal}}</p>
              ${order.discount > 0 ? `<p style="color: #e74c3c;">Discount: -{{discount}}</p>` : ''}
              <p style="font-size: 24px; color: #667eea;">Total: {{total}}</p>
            </div>
            
            <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
            <p><strong>Payment Status:</strong> {{paymentStatus}}</p>
            
            <p>Your order will be processed once payment is confirmed by our team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Gaming Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  const { subject, html } = await getTemplate('email.template.order_confirmation', {
    name,
    orderNumber: order.orderNumber,
    itemsHtml,
    subtotal: formatCurrency(order.subtotal),
    discount: formatCurrency(order.discount),
    total: formatCurrency(order.total),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus
  }, defaults);

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: email,
    subject,
    html
  };

  try {
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timed out after 5 seconds')), 5000))
    ]);
    logger.info('Order confirmation email sent', { email });

    await queueEmail({
      to: email,
      subject: mailOptions.subject,
      html: mailOptions.html,
      emailType: 'order_confirmation',
      status: 'sent',
      sentAt: new Date()
    });
  } catch (error) {
    logger.error('Failed to send order confirmation email directly, queuing', { email, error: error.message });
    await queueEmail({
      to: email,
      subject: mailOptions.subject,
      html: mailOptions.html,
      emailType: 'order_confirmation',
      status: 'pending'
    });
  }
};

/**
 * Send payment confirmation email
 */
const sendPaymentConfirmationEmail = async (email, name, order) => {
  const defaults = {
    subject: `Payment Confirmed - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 64px; text-align: center; margin: 20px 0; }
          .amount { background: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #27ae60; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{logoUrl}}" alt="Logo" style="max-height: 50px; margin-bottom: 10px; display: {{logoDisplay}};" />
            <h1>Payment Confirmed!</h1>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <p>Hi {{name}},</p>
            <p>Great news! Your payment has been confirmed and your order is now being processed.</p>
            
            <div class="amount">{{total}}</div>
            
            <p><strong>Order Number:</strong> {{orderNumber}}</p>
            <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
            
            <p>You will receive your digital products shortly. Thank you for shopping with us!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Gaming Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  const { subject, html } = await getTemplate('email.template.payment_confirmation', {
    name,
    orderNumber: order.orderNumber,
    total: formatCurrency(order.total),
    paymentMethod: order.paymentMethod
  }, defaults);

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: email,
    subject,
    html
  };

  try {
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timed out after 5 seconds')), 5000))
    ]);
    logger.info('Payment confirmation email sent', { email });

    await queueEmail({
      to: email,
      subject: mailOptions.subject,
      html: mailOptions.html,
      emailType: 'payment_confirmation',
      status: 'sent',
      sentAt: new Date()
    });
  } catch (error) {
    logger.error('Failed to send payment confirmation email directly, queuing', { email, error: error.message });
    await queueEmail({
      to: email,
      subject: mailOptions.subject,
      html: mailOptions.html,
      emailType: 'payment_confirmation',
      status: 'pending'
    });
  }
};

/**
 * Send password reset code email
 */
const sendPasswordResetCodeEmail = async (email, name, code) => {
  const defaults = {
    subject: 'Password Reset Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{logoUrl}}" alt="Logo" style="max-height: 50px; margin-bottom: 10px; display: {{logoUrl ? 'block' : 'none'}};" />
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hi {{name}},</p>
            <p>You requested to reset your password. Use the code below to proceed:</p>
            <div class="code">{{code}}</div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Gaming Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  const { subject, html } = await getTemplate('email.template.password_reset', { name, code }, defaults);

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: email,
    subject,
    html
  };

  try {
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timed out after 5 seconds')), 5000))
    ]);
    logger.info('Password reset email sent', { email });

    await queueEmail({
      to: email,
      subject: mailOptions.subject,
      html: mailOptions.html,
      emailType: 'password_reset',
      status: 'sent',
      sentAt: new Date()
    });
  } catch (error) {
    logger.error('Failed to send password reset email directly, queuing', { email, error: error.message });
    await queueEmail({
      to: email,
      subject: mailOptions.subject,
      html: mailOptions.html,
      emailType: 'password_reset',
      status: 'pending'
    });
  }
};

module.exports = {
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendPasswordResetCodeEmail
};
