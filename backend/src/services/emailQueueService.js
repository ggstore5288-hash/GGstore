const EmailQueue = require('../models/EmailQueue');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Add email to queue
 */
const queueEmail = async (emailData) => {
    try {
        const emailQueue = await EmailQueue.create({
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
            emailType: emailData.emailType || 'other',
            status: emailData.status || 'pending',
            sentAt: emailData.sentAt || null,
            attempts: emailData.status === 'sent' ? 1 : 0,
            lastAttemptAt: emailData.status === 'sent' ? new Date() : null
        });

        logger.info('Email queued', { emailId: emailQueue._id, to: emailData.to });
        return emailQueue;
    } catch (error) {
        logger.error('Failed to queue email', { error: error.message });
        throw error;
    }
};

/**
 * Process email queue
 */
const processEmailQueue = async () => {
    try {
        // Get pending emails that haven't exceeded max attempts
        const pendingEmails = await EmailQueue.find({
            status: { $in: ['pending', 'failed'] },
            $expr: { $lt: ['$attempts', { $ifNull: ['$maxAttempts', 3] }] }
        })
            .sort({ createdAt: 1 })
            .limit(10); // Process 10 at a time

        for (const emailQueue of pendingEmails) {
            try {
                // Update status to sending
                emailQueue.status = 'sending';
                emailQueue.attempts += 1;
                emailQueue.lastAttemptAt = new Date();
                await emailQueue.save();

                // Send email based on type
                await sendEmailByType(emailQueue);

                // Mark as sent
                emailQueue.status = 'sent';
                emailQueue.sentAt = new Date();
                emailQueue.errorMessage = null;
                await emailQueue.save();

                logger.info('Email sent successfully', { emailId: emailQueue._id, to: emailQueue.to });
            } catch (error) {
                // Mark as failed
                emailQueue.status = 'failed';
                emailQueue.errorMessage = error.message;
                await emailQueue.save();

                logger.error('Failed to send email', {
                    emailId: emailQueue._id,
                    to: emailQueue.to,
                    error: error.message,
                    attempts: emailQueue.attempts
                });
            }
        }
    } catch (error) {
        logger.error('Error processing email queue', { error: error.message });
    }
};

/**
 * Send email based on type
 */
const sendEmailByType = async (emailQueue) => {
    // For now, we'll use the transporter directly since we have the HTML
    // In a more advanced setup, you'd reconstruct the email from queue data
    const transporter = require('../config/email');

    await transporter.sendMail({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: emailQueue.to,
        subject: emailQueue.subject,
        html: emailQueue.html
    });
};

/**
 * Retry failed emails
 */
const retryFailedEmails = async () => {
    try {
        const failedEmails = await EmailQueue.find({
            status: 'failed',
            attempts: { $lt: 3 }
        })
            .sort({ lastAttemptAt: 1 })
            .limit(20);

        for (const email of failedEmails) {
            // Reset to pending for retry
            email.status = 'pending';
            await email.save();
        }

        logger.info(`Reset ${failedEmails.length} failed emails for retry`);
    } catch (error) {
        logger.error('Error retrying failed emails', { error: error.message });
    }
};

// Process email queue every 30 seconds
setInterval(() => {
    processEmailQueue().catch(err => {
        logger.error('Critical error in processEmailQueue interval', { error: err.message, stack: err.stack });
    });
}, 30 * 1000);

// Retry failed emails every 5 minutes
setInterval(() => {
    retryFailedEmails().catch(err => {
        logger.error('Critical error in retryFailedEmails interval', { error: err.message, stack: err.stack });
    });
}, 5 * 60 * 1000);

module.exports = {
    queueEmail,
    processEmailQueue,
    retryFailedEmails
};
