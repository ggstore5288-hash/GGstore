import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const VerifyEmail = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const { verifyEmail, resendVerification } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { isRTL } = useLanguage();
    const inputRefs = useRef([]);

    // Get email from navigation state OR sessionStorage fallback
    const email = location.state?.email || sessionStorage.getItem('pendingVerifyEmail') || '';

    useEffect(() => {
        // Redirect if no email provided
        if (!email) {
            navigate('/signup');
        }
    }, [email, navigate]);

    useEffect(() => {
        // Countdown timer for resend cooldown
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData) {
            const newCode = [...code];
            for (let i = 0; i < pastedData.length && i < 6; i++) {
                newCode[i] = pastedData[i];
            }
            setCode(newCode);
            // Focus the next empty input or the last one
            const nextEmptyIndex = newCode.findIndex(c => !c);
            inputRefs.current[nextEmptyIndex !== -1 ? nextEmptyIndex : 5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const verificationCode = code.join('');
        if (verificationCode.length !== 6) {
            setError(isRTL ? 'يرجى إدخال الرمز المكون من 6 أرقام' : 'Please enter the 6-digit code');
            return;
        }

        setLoading(true);
        try {
            await verifyEmail(email, verificationCode);
            // Clear the pending email from sessionStorage
            sessionStorage.removeItem('pendingVerifyEmail');
            setSuccess(isRTL ? 'تم التحقق من البريد الإلكتروني بنجاح!' : 'Email verified successfully!');
            // Navigate to home after short delay
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || err.message || (isRTL ? 'رمز التحقق غير صحيح' : 'Invalid verification code'));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setResendLoading(true);
        setError('');
        try {
            await resendVerification(email);
            setSuccess(isRTL ? 'تم إرسال رمز جديد إلى بريدك الإلكتروني' : 'New code sent to your email');
            setResendCooldown(60); // 60 second cooldown
            setCode(['', '', '', '', '', '']); // Clear the code inputs
        } catch (err) {
            setError(err.response?.data?.message || err.message || (isRTL ? 'فشل في إعادة إرسال الرمز' : 'Failed to resend code'));
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
                {isRTL ? 'تحقق من بريدك الإلكتروني' : 'Verify Your Email'}
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                {isRTL
                    ? `أرسلنا رمز تحقق مكون من 6 أرقام إلى ${email}`
                    : `We've sent a 6-digit verification code to ${email}`
                }
            </p>
            <p style={{ textAlign: 'center', color: 'var(--color-cyan-primary)', fontSize: '13px', marginBottom: '20px', fontWeight: '500' }}>
                {isRTL ? 'يرجى التحقق من مجلد البريد العشوائي (Spam) إذا لم تجده.' : 'If you don\'t see the email, please check your spam/junk folder.'}
            </p>

            {error && <div className="error-message">{error}</div>}
            {success && (
                <div style={{
                    background: 'rgba(0, 217, 255, 0.1)',
                    color: 'var(--color-cyan-primary)',
                    padding: '15px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginBottom: '20px',
                    borderLeft: '3px solid var(--color-cyan-primary)'
                }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                    direction: 'ltr' // Always LTR for code input
                }}>
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            style={{
                                width: '50px',
                                height: '60px',
                                textAlign: 'center',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                border: '2px solid var(--color-border)',
                                borderRadius: '8px',
                                background: 'var(--color-bg-secondary)',
                                color: '#fff',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan-primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                        />
                    ))}
                </div>

                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '15px' }}>
                    {isRTL ? 'الرمز صالح لمدة 15 دقيقة' : 'Code expires in 15 minutes'}
                </p>

                <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? (isRTL ? 'جاري التحقق...' : 'Verifying...') : (isRTL ? 'تحقق' : 'Verify')}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '10px' }}>
                    {isRTL ? 'لم تستلم الرمز؟' : "Didn't receive the code?"}
                </p>
                <button
                    onClick={handleResend}
                    disabled={resendLoading || resendCooldown > 0}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: resendCooldown > 0 ? 'var(--color-text-muted)' : 'var(--color-cyan-primary)',
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        textDecoration: 'underline'
                    }}
                >
                    {resendLoading
                        ? (isRTL ? 'جاري الإرسال...' : 'Sending...')
                        : resendCooldown > 0
                            ? (isRTL ? `إعادة الإرسال بعد ${resendCooldown} ثانية` : `Resend in ${resendCooldown}s`)
                            : (isRTL ? 'إعادة إرسال الرمز' : 'Resend Code')
                    }
                </button>
            </div>

            <div className="auth-footer">
                <Link to="/login" className="auth-link">{isRTL ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}</Link>
            </div>
        </div>
    );
};

export default VerifyEmail;
