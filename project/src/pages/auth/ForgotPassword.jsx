import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
    // Step: 1 = enter email, 2 = enter code, 3 = enter new password
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const { forgotPassword, verifyResetCode, resetPassword } = useAuth();
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    useEffect(() => {
        // Countdown timer for resend cooldown
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess(isRTL ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني' : 'Verification code sent to your email');
            setStep(2);
            setResendCooldown(60);
        } catch (err) {
            console.error('Forgot password error:', err);
            setError(err.response?.data?.message || err.message || (isRTL ? 'فشل إرسال رمز إعادة التعيين. يرجى المحاولة مرة أخرى.' : 'Failed to send reset code. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (index, value) => {
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
            const nextEmptyIndex = newCode.findIndex(c => !c);
            inputRefs.current[nextEmptyIndex !== -1 ? nextEmptyIndex : 5]?.focus();
        }
    };

    const handleCodeSubmit = async (e) => {
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
            await verifyResetCode(email, verificationCode);
            setSuccess(isRTL ? 'تم التحقق من الرمز بنجاح' : 'Code verified successfully');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || err.message || (isRTL ? 'رمز التحقق غير صحيح' : 'Invalid verification code'));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError(isRTL ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, code.join(''), newPassword);
            setSuccess(isRTL ? 'تم إعادة تعيين كلمة المرور بنجاح!' : 'Password reset successfully!');
            // Navigate to login after short delay
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || (isRTL ? 'فشل في إعادة تعيين كلمة المرور' : 'Failed to reset password'));
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        setError('');
        setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess(isRTL ? 'تم إرسال رمز جديد إلى بريدك الإلكتروني' : 'New code sent to your email');
            setResendCooldown(60);
            setCode(['', '', '', '', '', '']);
        } catch (err) {
            setError(err.response?.data?.message || err.message || (isRTL ? 'فشل في إعادة إرسال الرمز' : 'Failed to resend code'));
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '10px', 
            marginBottom: '25px' 
        }}>
            {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                    <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: step >= s ? 'var(--color-cyan-primary)' : 'var(--color-bg-secondary)',
                        color: step >= s ? '#000' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        transition: 'all 0.3s'
                    }}>
                        {s}
                    </div>
                    {s < 3 && (
                        <div style={{
                            width: '40px',
                            height: '2px',
                            background: step > s ? 'var(--color-cyan-primary)' : 'var(--color-bg-secondary)',
                            transition: 'all 0.3s'
                        }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#fff' }}>
                {isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
            </h2>
            
            {renderStepIndicator()}
            
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                {step === 1 && (isRTL 
                    ? 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رمز التحقق.'
                    : "Enter your email address and we'll send you a verification code."
                )}
                {step === 2 && (isRTL 
                    ? `أدخل الرمز المرسل إلى ${email}`
                    : `Enter the code sent to ${email}`
                )}
                {step === 3 && (isRTL 
                    ? 'أدخل كلمة المرور الجديدة'
                    : 'Enter your new password'
                )}
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

            {/* Step 1: Enter Email */}
            {step === 1 && (
                <form onSubmit={handleEmailSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">
                            {isRTL ? 'البريد الإلكتروني' : 'Email Address'} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? (isRTL ? 'جاري الإرسال...' : 'Sending...') : (isRTL ? 'إرسال رمز التحقق' : 'Send Verification Code')}
                    </button>
                </form>
            )}

            {/* Step 2: Enter Code */}
            {step === 2 && (
                <form onSubmit={handleCodeSubmit} className="auth-form">
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '10px', 
                        marginBottom: '20px',
                        direction: 'ltr'
                    }}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
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
                        {loading ? (isRTL ? 'جاري التحقق...' : 'Verifying...') : (isRTL ? 'تحقق من الرمز' : 'Verify Code')}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={loading || resendCooldown > 0}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: resendCooldown > 0 ? 'var(--color-text-muted)' : 'var(--color-cyan-primary)',
                                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                textDecoration: 'underline'
                            }}
                        >
                            {resendCooldown > 0 
                                ? (isRTL ? `إعادة الإرسال بعد ${resendCooldown} ثانية` : `Resend in ${resendCooldown}s`)
                                : (isRTL ? 'إعادة إرسال الرمز' : 'Resend Code')
                            }
                        </button>
                    </div>
                </form>
            )}

            {/* Step 3: Enter New Password */}
            {step === 3 && (
                <form onSubmit={handlePasswordSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">
                            {isRTL ? 'كلمة المرور الجديدة' : 'New Password'} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder={isRTL ? 'أدخل كلمة المرور الجديدة (8 أحرف على الأقل)' : 'Enter new password (min 8 characters)'}
                            minLength={8}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder={isRTL ? 'أعد إدخال كلمة المرور' : 'Confirm your password'}
                            minLength={8}
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? (isRTL ? 'جاري إعادة التعيين...' : 'Resetting...') : (isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset Password')}
                    </button>
                </form>
            )}

            <div className="auth-footer">
                {step > 1 ? (
                    <button
                        onClick={() => {
                            setStep(step - 1);
                            setError('');
                            setSuccess('');
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-cyan-primary)',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {isRTL ? '← رجوع' : '← Back'}
                    </button>
                ) : (
                    <Link to="/login" className="auth-link">{isRTL ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}</Link>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
