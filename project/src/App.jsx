import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { GameProvider } from './context/GameContext';
import { ProductProvider } from './context/ProductContext';
import { LanguageProvider } from './context/LanguageContext'; // Added this
import { SettingsProvider } from './context/SettingsContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Components
import Header from './components/Header';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot/ChatBot';


// Pages - Public
import Games from './pages/Games';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile'; // Import Profile page
import Categories from './pages/Categories';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Newsletter from './pages/Newsletter';

// Pages - Auth
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';

// Pages - Admin
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import Analytics from './pages/admin/Analytics';
import Payments from './pages/admin/Payments';
import PromoCodes from './pages/admin/PromoCodes';
import FlashSales from './pages/admin/FlashSales';
import Loyalty from './pages/admin/Loyalty';
import Reviews from './pages/admin/Reviews';
import Content from './pages/admin/Content';
import AdminNewsletter from './pages/admin/Newsletter';
import EmailQueue from './pages/admin/EmailQueue';
import EmailTemplates from './pages/admin/EmailTemplates';
import AuditLogs from './pages/admin/AuditLogs';
import Settings from './pages/admin/Settings';
import PaymentMethods from './pages/admin/PaymentMethods';
import AdminChatBot from './pages/admin/AdminChatBot';


// Protected Route Component
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

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
        <ChatBot />
        <Footer />
    </div>
);


const App = () => {
    return (
        <Router>
            <ToastProvider>
                <LanguageProvider>  {/* Added Provider */}
                    <SettingsProvider>
                        <AuthProvider>
                            <CartProvider>
                                <ProductProvider>
                                    <GameProvider>
                                        <Routes>
                                            {/* Auth Routes */}
                                            <Route element={<AuthLayout />}>
                                                <Route path="/login" element={<Login />} />
                                                <Route path="/signup" element={<SignUp />} />
                                                <Route path="/verify-email" element={<VerifyEmail />} />
                                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                            </Route>

                                            {/* Admin Routes */}
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
                                            <Route path="/" element={
                                                <PublicLayout>
                                                    <Home />
                                                </PublicLayout>
                                            } />
                                            <Route path="/games" element={
                                                <PublicLayout>
                                                    <Games />
                                                </PublicLayout>
                                            } />
                                            <Route path="/categories" element={
                                                <PublicLayout>
                                                    <Categories />
                                                </PublicLayout>
                                            } />
                                            <Route path="/product/:id" element={
                                                <PublicLayout>
                                                    <ProductDetails />
                                                </PublicLayout>
                                            } />
                                            <Route path="/cart" element={
                                                <PublicLayout>
                                                    <Cart />
                                                </PublicLayout>
                                            } />
                                            <Route path="/checkout" element={
                                                <PublicLayout>
                                                    <ProtectedRoute>
                                                        <Checkout />
                                                    </ProtectedRoute>
                                                </PublicLayout>
                                            } />
                                            <Route path="/about" element={
                                                <PublicLayout>
                                                    <About />
                                                </PublicLayout>
                                            } />
                                            <Route path="/privacy-policy" element={
                                                <PublicLayout>
                                                    <PrivacyPolicy />
                                                </PublicLayout>
                                            } />
                                            <Route path="/newsletter" element={
                                                <PublicLayout>
                                                    <Newsletter />
                                                </PublicLayout>
                                            } />

                                            {/* Fallback */}
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                            <Route path="/profile" element={
                                                <PublicLayout>
                                                    <ProtectedRoute>
                                                        <Profile />
                                                    </ProtectedRoute>
                                                </PublicLayout>
                                            } />
                                        </Routes>
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
