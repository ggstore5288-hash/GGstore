import React, { useState, useEffect, useRef } from 'react';
import {
    Mail, Send, Trash2, Users, Search,
    Filter, RefreshCw, X, Image as ImageIcon,
    Eye, Layout, CheckCircle, AlertCircle
} from 'lucide-react';
import adminAPI from '../../api/admin';

const AdminNewsletter = () => {
    // State management
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers' or 'send'

    // Compose form state
    const [emailData, setEmailData] = useState({
        subject: '',
        template: '',
        imageUrl: ''
    });
    const [sending, setSending] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // File upload state
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (activeTab === 'subscribers') {
            loadSubscribers();
        }
    }, [page, activeTab]);

    const loadSubscribers = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getNewsletterSubscribers(page);
            setSubscribers(result?.data?.subscribers || []);
            setTotalPages(result?.data?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load subscribers:', error);
            alert('Error loading subscribers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this subscriber?')) {
            try {
                await adminAPI.deleteNewsletterSubscriber(id);
                loadSubscribers();
            } catch (error) {
                alert('Failed to delete subscriber');
            }
        }
    };

    const handleSendNewsletter = async (e) => {
        e.preventDefault();
        if (!emailData.subject || !emailData.template) {
            alert('Subject and Message are required');
            return;
        }

        if (!window.confirm('Are you sure you want to send this newsletter to ALL active subscribers?')) {
            return;
        }

        try {
            setSending(true);
            const result = await adminAPI.sendNewsletter(emailData);
            alert(result.message || 'Newsletter sent to queue successfully');
            setEmailData({ subject: '', template: '', imageUrl: '' });
            setActiveTab('subscribers');
        } catch (error) {
            console.error('Failed to send newsletter:', error);
            alert(error.response?.data?.error || 'Failed to send newsletter');
        } finally {
            setSending(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const result = await adminAPI.uploadFile(file);
            setEmailData(prev => ({ ...prev, imageUrl: result.data.url }));
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Image upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="admin-container">
            <header className="admin-header" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title">Newsletter Management</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
                        Manage subscribers and broadcast transmissions
                    </p>
                </div>
            </header>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '32px',
                padding: '4px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                width: '100%',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
            }}>
                <button
                    className={`nav-tab ${activeTab === 'subscribers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subscribers')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'subscribers' ? 'var(--color-cyan-primary)' : 'transparent',
                        color: activeTab === 'subscribers' ? '#000' : '#fff',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Users size={16} />
                    Subscribers
                </button>
                <button
                    className={`nav-tab ${activeTab === 'send' ? 'active' : ''}`}
                    onClick={() => setActiveTab('send')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'send' ? 'var(--color-cyan-primary)' : 'transparent',
                        color: activeTab === 'send' ? '#000' : '#fff',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Send size={16} />
                    Send Transmission
                </button>
            </div>

            {activeTab === 'subscribers' ? (
                <div className="admin-card">
                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            <RefreshCw size={32} className="spinning" style={{ marginBottom: '16px' }} />
                            <p>Loading database candidates...</p>
                        </div>
                    ) : subscribers.length === 0 ? (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <Users size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                            <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>No subscribers found.</p>
                        </div>
                    ) : (
                        <>
                            <div className="newsletter-table-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            <th style={{ textAlign: 'left', padding: '16px', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '600' }}>EMAIL ADDRESS</th>
                                            <th style={{ textAlign: 'left', padding: '16px', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '600' }}>SUBSCRIBED ON</th>
                                            <th style={{ textAlign: 'right', padding: '16px', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '600' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers.map((sub) => (
                                            <tr key={sub._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.02)', transition: 'background 0.2s' }}>
                                                <td style={{ padding: '16px', color: 'var(--color-cyan-primary)', fontWeight: '500' }}>{sub.email}</td>
                                                <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>{formatDate(sub.subscribedAt)}</td>
                                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => handleDelete(sub._id)}
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            color: '#ef4444',
                                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        title="Delete Subscriber"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="btn-secondary"
                                    >
                                        Previous
                                    </button>
                                    <span style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="btn-secondary"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <div className="newsletter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                    {/* Compose Form */}
                    <div className="admin-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Layout size={20} color="var(--color-cyan-primary)" />
                            Compose Transmission
                        </h3>

                        <form onSubmit={handleSendNewsletter}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                                    SUBJECT LINE
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter transmission subject..."
                                    value={emailData.subject || ''}
                                    onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                                    required
                                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.02)' }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                                    HEADER IMAGE (OPTIONAL)
                                </label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Image URL..."
                                        value={emailData.imageUrl || ''}
                                        onChange={(e) => setEmailData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                        style={{ flex: 1, background: 'rgba(255, 255, 255, 0.02)' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <ImageIcon size={18} />
                                        {uploading ? 'UPLOADING...' : 'UPLOAD'}
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                                {emailData.imageUrl && (
                                    <div style={{ marginTop: '12px', position: 'relative', width: 'fit-content' }}>
                                        <img src={emailData.imageUrl} alt="Header Preview" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                                        <button
                                            type="button"
                                            onClick={() => setEmailData(prev => ({ ...prev, imageUrl: '' }))}
                                            style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                                    MESSAGE CONTENT (HTML SUPPORTED)
                                </label>
                                <textarea
                                    className="form-input"
                                    rows="12"
                                    placeholder="Write your transmission content here..."
                                    value={emailData.template}
                                    onChange={(e) => setEmailData(prev => ({ ...prev, template: e.target.value }))}
                                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.02)', fontFamily: 'monospace', resize: 'vertical' }}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={sending || !emailData.subject || !emailData.template}
                                style={{ width: '100%', height: '56px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                            >
                                {sending ? (
                                    <>
                                        <RefreshCw size={20} className="spinning" />
                                        QUEUING TRANSMISSION...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        BROADCAST TO SUBSCRIBERS
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Live Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="admin-card" style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Eye size={20} color="var(--color-cyan-primary)" />
                                Transmission Preview
                            </h3>

                            <div style={{
                                flex: 1,
                                background: '#f5f7f9',
                                borderRadius: '16px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                padding: '0',
                                overflow: 'hidden',
                                minHeight: '400px',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{ padding: '16px 20px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>SUBJECT</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: '700' }}>{emailData.subject || 'No Subject Defined'}</div>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
                                    {emailData.imageUrl && (
                                        <img src={emailData.imageUrl} alt="Header" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                    )}
                                    <div
                                        style={{ padding: '32px', color: '#334155', lineHeight: '1.6' }}
                                        dangerouslySetInnerHTML={{ __html: emailData.template || '<p style="color: #94a3b8; font-style: italic;">No content written yet...</p>' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '12px', display: 'flex', gap: '12px' }}>
                                <AlertCircle size={20} color="var(--color-cyan-primary)" style={{ flexShrink: 0 }} />
                                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                                    <strong>Tip:</strong> You can use standard HTML tags like <code>&lt;h1&gt;</code>, <code>&lt;b&gt;</code>, <code>&lt;p&gt;</code>, and <code>&lt;a&gt;</code> to style your transmission.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .nav-tab:hover:not(.active) {
                    background: rgba(255, 255, 255, 0.05) !important;
                }
                .btn-secondary:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: var(--color-cyan-primary) !important;
                }
                .spinning {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AdminNewsletter;
