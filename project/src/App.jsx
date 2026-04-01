import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { GameProvider } from './context/GameContext';
import { ProductProvider } from './context/ProductContext';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { useProducts } from './context/ProductContext';
import InitialLoader from './components/InitialLoader';

// Layouts (always needed, keep static)
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';

// Core components always needed on first load (keep static)
import Header from './components/Header';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

// Lazy-loaded components (only downloaded when the user navigates there)
const ChatBot = lazy(() => import('./components/ChatBot/ChatBot'));

// Pages - Public (lazy loaded)
const Home = lazy(() => import('./pages/Home'));
const Games = lazy(() => import('./pages/Games'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Profile = lazy(() => import('./pages/Profile'));
const Categories = lazy(() => import('./pages/Categories'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Newsletter = lazy(() => import('./pages/Newsletter'));

// Pages - Auth (lazy loaded)
const Login = lazy(() => import('./pages/auth/Login'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

// Pages - Admin (lazy loaded — never downloaded by regular users)
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Products = lazy(() => import('./pages/admin/Products'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Users = lazy(() => import('./pages/admin/Users'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Payments = lazy(() => import('./pages/admin/Payments'));
const PromoCodes = lazy(() => import('./pages/admin/PromoCodes'));
const FlashSales = lazy(() => import('./pages/admin/FlashSales'));
const Loyalty = lazy(() => import('./pages/admin/Loyalty'));
const Reviews = lazy(() => import('./pages/admin/Reviews'));
const Content = lazy(() => import('./pages/admin/Content'));
const AdminNewsletter = lazy(() => import('./pages/admin/Newsletter'));
const EmailQueue = lazy(() => import('./pages/admin/EmailQueue'));
const EmailTemplates = lazy(() => import('./pages/admin/EmailTemplates'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const PaymentMethods = lazy(() => import('./pages/admin/PaymentMethods'));
const AdminChatBot = lazy(() => import('./pages/admin/AdminChatBot'));

// Minimal loading fallback — lightweight, no heavy spinner component
const PageLoader = () => (
    <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary, #0f1419)'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0, 217, 255, 0.15)',
            borderTopColor: '#00d9ff',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

const ProtectedRoute = ({ children, requireAdmin }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) return <PageLoader />;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const PublicLayout = ({ children }) => (
    <div className="app-container">
        <Header />
        <main className="main-content">
            {children}
        </main>
        <Suspense fallback={null}>
            <ChatBot />
        </Suspense>
        <Footer />
    </div>
);

const AppContent = () => {
    const { loadingSettings } = useSettings();
    const { loading: loadingAuth } = useAuth();
    const { loading: loadingProducts } = useProducts();

    // The app is "ready" when the core contexts have finished their initial fetch
    const isReady = !loadingSettings && !loadingAuth && !loadingProducts;

    return (
        <InitialLoader ready={isReady}>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Auth Routes */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                    </Route>

                    {/* Admin Routes — entire admin bundle only loads for admins */}
                    <Route path="/admin" element={
                        <ProtectedRoute requireAdmin>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="users" element={<Users />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="payments" element={<Payments />} />
                        <Route path="promo-codes" element={<PromoCodes />} />
                        <Route path="flash-sales" element={<FlashSales />} />
                        <Route path="loyalty" element={<Loyalty />} />
                        <Route path="reviews" element={<Reviews />} />
                        <Route path="content" element={<Content />} />
                        <Route path="newsletter" element={<AdminNewsletter />} />
                        <Route path="email-queue" element={<EmailQueue />} />
                        <Route path="email-templates" element={<EmailTemplates />} />
                        <Route path="audit-logs" element={<AuditLogs />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="payment-methods" element={<PaymentMethods />} />
                        <Route path="chatbot" element={<AdminChatBot />} />
                    </Route>

                    {/* Public Routes */}
                    <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                    <Route path="/games" element={<PublicLayout><Games /></PublicLayout>} />
                    <Route path="/categories" element={<PublicLayout><Categories /></PublicLayout>} />
                    <Route path="/product/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
                    <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
                    <Route path="/checkout" element={
                        <PublicLayout>
                            <ProtectedRoute><Checkout /></ProtectedRoute>
                        </PublicLayout>
                    } />
                    <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                    <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
                    <Route path="/newsletter" element={<PublicLayout><Newsletter /></PublicLayout>} />
                    <Route path="/profile" element={
                        <PublicLayout>
                            <ProtectedRoute><Profile /></ProtectedRoute>
                        </PublicLayout>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </InitialLoader>
    );
};

const App = () => {
    return (
        <Router>
            <ToastProvider>
                <LanguageProvider>
                    <SettingsProvider>
                        <AuthProvider>
                            <CartProvider>
                                <ProductProvider>
                                    <GameProvider>
                                        <AppContent />
                                    </GameProvider>
                                </ProductProvider>
                            </CartProvider>
                        </AuthProvider>
                    </SettingsProvider>
                </LanguageProvider>
            </ToastProvider>
        </Router>
    );
};

export default App;
