/**
 * Security Monitoring Utility
 *
 * Tracks global failed login attempt spikes and emits structured
 * security warnings via the logger. Designed as an in-memory
 * lightweight monitor — no extra dependencies required.
 */
const logger = require('./logger');

// --- Global Spike Tracker ---
// Tracks failed login attempts globally (across all IPs/users) in a rolling 5-minute window.
const SPIKE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const SPIKE_THRESHOLD = 20; // Alert if 20+ failures in 5 minutes globally
const failureTimestamps = [];

/**
 * Record a failed login attempt and check for a system-wide spike.
 * @param {string} ip - The IP address of the failed request.
 * @param {string} email - The email that was attempted.
 */
function recordFailedAttempt(ip, email) {
    const now = Date.now();
    failureTimestamps.push(now);

    // Prune old entries outside the window
    while (failureTimestamps.length > 0 && failureTimestamps[0] < now - SPIKE_WINDOW_MS) {
        failureTimestamps.shift();
    }

    if (failureTimestamps.length >= SPIKE_THRESHOLD) {
        logger.warn('[SECURITY ALERT] Global login failure spike detected', {
            failuresInWindow: failureTimestamps.length,
            windowMinutes: SPIKE_WINDOW_MS / 60000,
            latestAttemptIp: ip,
            latestAttemptEmail: email,
            alert: 'Possible brute-force or credential-stuffing attack in progress. Review rate limiting and consider blocking affected IPs.',
        });
    }
}

/**
 * Record that a specific user account has been locked due to failed attempts.
 * @param {string} email - The email of the locked account.
 * @param {string} ip - The IP that triggered the final lock.
 */
function recordAccountLocked(email, ip) {
    logger.warn('[SECURITY ALERT] User account locked due to failed login attempts', {
        email,
        lockedFromIp: ip,
        alert: 'Account was locked after 5 consecutive failed login attempts.',
    });
}

module.exports = { recordFailedAttempt, recordAccountLocked };
