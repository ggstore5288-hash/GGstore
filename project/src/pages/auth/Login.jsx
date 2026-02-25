import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [errorCountdown, setErrorCountdown] = useState(0);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { t, isRTL } = useLanguage();
    const navigate = useNavigate();
    const countdownRef = useRef(null);

    // Auto-clear error after 30 seconds with countdown
    useEffect(() => {
        if (!error) return;

        setErrorCountdown(30);
        clearInterval(countdownRef.current);

        countdownRef.current = setInterval(() => {
            setErrorCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    setError('');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownRef.current);
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            if (data.user?.role === 'ADMIN' || data.user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
                {isRTL ? 'مرحباً بعودتك' : 'Welcome Back'}
            </h2>
            {error && (
                <div className="error-message" style={{ position: 'relative' }}>
                    <span>{error}</span>
                    <span style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '11px',
                        opacity: 0.6,
                        fontVariantNumeric: 'tabular-nums'
                    }}>
                        {errorCountdown}s
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label className="form-label">{isRTL ? 'عنوان البريد الإلكتروني' : 'Email Address'}</label>
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
                    <label className="form-label">{isRTL ? 'كلمة المرور' : 'Password'}</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                    />
                </div>

                <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                    <Link to="/forgot-password" style={{ fontSize: '12px', color: '#00d9ff', textDecoration: 'none' }}>
                        {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                    </Link>
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? (isRTL ? 'جاري تسجيل الدخول...' : 'Signing In...') : t('signIn')}
                </button>
            </form>

            <div className="auth-footer">
                {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"} <Link to="/signup" className="auth-link">{t('createAccount')}</Link>
            </div>
        </div>
    );
};

export default Login;
