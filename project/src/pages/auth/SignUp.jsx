import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();
    const { isRTL } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
            return;
        }

        // Validate password length
        if (password.length < 8) {
            setError(isRTL ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const result = await signup(name, email, password, phone);
            // Save email to sessionStorage as fallback in case location.state is lost
            sessionStorage.setItem('pendingVerifyEmail', email);
            // Navigate to verification page with email
            navigate('/verify-email', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.message || err.message || (isRTL ? 'فشل في إنشاء الحساب' : 'Failed to create account'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
                {isRTL ? 'إنشاء حساب جديد' : 'Sign Up'}
            </h2>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label className="form-label">
                        {isRTL ? 'الاسم الكامل' : 'Full Name'} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder={isRTL ? 'مثال: محمد أحمد' : 'e.g. John Doe'}
                    />
                </div>

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

                <div className="form-group">
                    <label className="form-label">
                        {isRTL ? 'رقم الهاتف' : 'Phone Number'} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="tel"
                        className="form-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder={isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">
                        {isRTL ? 'كلمة المرور' : 'Password'} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder={isRTL ? 'أنشئ كلمة مرور (8 أحرف على الأقل)' : 'Create a password (min 8 characters)'}
                        minLength={8}
                    />
                    <small style={{ color: '#888', marginTop: '5px', display: 'block' }}>
                        Must be at least 8 characters with uppercase, lowercase, and number
                    </small>
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

                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '15px' }}>
                    <span style={{ color: '#ef4444' }}>*</span> {isRTL ? 'حقول مطلوبة' : 'Required fields'}
                </p>

                <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? (isRTL ? 'جاري إنشاء الحساب...' : 'Creating Account...') : (isRTL ? 'إنشاء حساب' : 'Sign Up')}
                </button>
            </form>

            <div className="auth-footer">
                {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'} <Link to="/login" className="auth-link">{isRTL ? 'تسجيل الدخول' : 'Sign In'}</Link>
            </div>
        </div>
    );
};

export default SignUp;
