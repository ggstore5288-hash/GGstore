import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Trash2, Filter, CheckCircle, XCircle, Clock, AlertCircle, Eye as EyeIcon, X } from 'lucide-react';
// Build force refresh: 1771186827000
import adminAPI from '../../api/admin';

const EmailQueue = () => {
    const [emails, setEmails] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        status: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [retrying, setRetrying] = useState(false);

    const [selectedEmail, setSelectedEmail] = useState(null);

    useEffect(() => {
        loadEmails();
    }, [page, filters]);

    const loadEmails = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getEmailQueue(page, 50, filters.status);
            setEmails(result?.data?.emails || []);
            setStats(result?.data?.stats || {});
            setTotalPages(result?.data?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load email queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async () => {
        try {
            setRetrying(true);
            await adminAPI.retryEmails();
            alert('Email queue processing triggered');
            loadEmails();
        } catch (error) {
            alert('Failed to retry emails: ' + error.message);
        } finally {
            setRetrying(false);
        }
    };

    const handleDelete = async (emailId) => {
        if (window.confirm('Are you sure you want to remove this email from the queue?')) {
            try {
                await adminAPI.deleteEmailFromQueue(emailId);
                loadEmails();
            } catch (error) {
                alert('Failed to delete email: ' + error.message);
            }
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />;
            case 'failed':
                return <XCircle size={16} style={{ color: 'var(--color-danger)' }} />;
            case 'sending':
                return <RefreshCw size={16} className="spinning" style={{ color: 'var(--color-warning)' }} />;
            default:
                return <Clock size={16} style={{ color: 'var(--color-info)' }} />;
        }
    };

    return (
        <div className="admin-container">
            <header className="admin-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title" style={{ margin: 0 }}>Email Queue</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
                        Monitor and manage outgoing system emails
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleRetry}
                        className="btn-secondary"
                        disabled={retrying}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <RefreshCw size={18} className={retrying ? 'spinning' : ''} />
                        {retrying ? 'Processing...' : 'Retry Failed'}
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </header>

            {/* Statistics Cards */}
            {Object.keys(stats).length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    {Object.entries(stats).map(([status, count]) => (
                        <div key={status} className="admin-card" style={{
                            padding: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            borderLeft: `4px solid ${status === 'sent' ? 'var(--color-success)' :
                                status === 'failed' ? 'var(--color-danger)' :
                                    status === 'sending' ? 'var(--color-warning)' :
                                        'var(--color-info)'
                                }`
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'var(--color-bg-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {status === 'sent' && <CheckCircle size={24} color="var(--color-success)" />}
                                {status === 'failed' && <XCircle size={24} color="var(--color-danger)" />}
                                {status === 'pending' && <Clock size={24} color="var(--color-info)" />}
                                {status === 'sending' && <RefreshCw size={24} color="var(--color-warning)" className="spinning" />}
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                                    {status}
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-primary)', fontFamily: 'Orbitron, sans-serif' }}>
                                    {count}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
                <div className="admin-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Status Filter</label>
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={e => handleFilterChange('status', e.target.value)}
                                style={{ width: '100%', background: 'var(--color-bg-primary)' }}
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="sending">Sending</option>
                                <option value="sent">Sent</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Log Table */}
            <div className="emails-list-minimal">
                <div className="emails-header-minimal">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={20} color="var(--color-primary)" style={{ marginRight: '12px' }} />
                        <span className="emails-header-title-minimal">Queue History</span>
                    </div>
                </div>

                <div className="emails-grid-container-minimal">
                    {/* Grid Header */}
                    <div className="emails-grid-header-minimal">
                        <div style={{ textAlign: 'left' }}>RECIPIENT</div>
                        <div style={{ textAlign: 'left' }}>SUBJECT</div>
                        <div style={{ textAlign: 'left' }}>TYPE</div>
                        <div style={{ textAlign: 'left' }}>STATUS</div>
                        <div style={{ textAlign: 'left' }}>ATTEMPTS</div>
                        <div style={{ textAlign: 'left' }}>CREATED</div>
                        <div style={{ textAlign: 'center' }}>ACTIONS</div>
                    </div>

                    {/* Grid Body */}
                    <div className="emails-grid-body-minimal">
                        {loading ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <RefreshCw size={32} className="spinning" style={{ marginBottom: '16px' }} />
                                <p>Loading email records...</p>
                            </div>
                        ) : emails.length === 0 ? (
                            <div className="empty-state" style={{ padding: '80px 20px', textAlign: 'center' }}>
                                <Mail size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                                <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>No emails found in the queue.</p>
                            </div>
                        ) : (
                            <>
                                {emails.map((email, index) => (
                                    <div
                                        key={email._id}
                                        className="emails-grid-row-minimal"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        {/* Recipient */}
                                        <div className="recipient-col-minimal">
                                            {email.to}
                                        </div>

                                        {/* Subject */}
                                        <div className="subject-col-minimal">
                                            <div className="subject-text-minimal">{email.subject}</div>
                                            {email.errorMessage && (
                                                <div className="error-text-minimal" title={email.errorMessage}>
                                                    {email.errorMessage.length > 50 ? email.errorMessage.substring(0, 50) + '...' : email.errorMessage}
                                                </div>
                                            )}
                                        </div>

                                        {/* Type */}
                                        <div className="type-col-minimal">
                                            <span className="type-badge-minimal">
                                                {email.emailType || 'other'}
                                            </span>
                                        </div>

                                        {/* Status */}
                                        <div className="status-col-minimal">
                                            <div className="status-badge-minimal">
                                                {getStatusIcon(email.status)}
                                                <span className={`status-label-minimal ${email.status}`}>
                                                    {email.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Attempts */}
                                        <div className="attempts-col-minimal">
                                            <span className="attempts-count-minimal" style={{
                                                color: email.attempts >= (email.maxAttempts || 3) ? 'var(--color-danger)' : '#ffffff'
                                            }}>
                                                {email.attempts || 0}
                                            </span>
                                            <span className="attempts-max-minimal">/ {email.maxAttempts || 3}</span>
                                        </div>

                                        {/* Created */}
                                        <div className="created-col-minimal">
                                            {formatDate(email.createdAt)}
                                        </div>

                                        {/* Actions */}
                                        <div className="actions-col-minimal">
                                            <button
                                                onClick={() => setSelectedEmail(email)}
                                                className="action-btn-minimal"
                                                title="View Email Content"
                                            >
                                                <EyeIcon size={16} />
                                            </button>
                                            {email.status === 'failed' && (
                                                <button
                                                    onClick={() => handleDelete(email._id)}
                                                    className="action-btn-minimal danger"
                                                    title="Remove from queue"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="pagination-minimal">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="pagination-btn-minimal"
                                        >
                                            Previous
                                        </button>
                                        <div className="pagination-info-minimal">
                                            Page <strong>{page}</strong> of {totalPages}
                                        </div>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="pagination-btn-minimal"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .emails-list-minimal {
                        font-family: 'Inter', sans-serif;
                    }

                    .emails-header-minimal {
                        padding: 12px 0;
                        margin-bottom: 8px;
                        display: flex;
                        align-items: center;
                    }

                    .emails-header-title-minimal {
                        font-size: 18px;
                        font-weight: 700;
                        color: #ffffff;
                        letter-spacing: -0.01em;
                    }

                    .emails-grid-header-minimal {
                        display: grid;
                        grid-template-columns: 2fr 3fr 1.5fr 1fr 1fr 1.5fr 80px;
                        padding: 12px 0;
                        color: #94a3b8;
                        font-size: 12px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        border-bottom: 2px solid #1e293b;
                    }

                    .emails-grid-row-minimal {
                        display: grid;
                        grid-template-columns: 2fr 3fr 1.5fr 1fr 1fr 1.5fr 80px;
                        padding: 16px 0;
                        align-items: center;
                        border-bottom: 1px solid #1e293b;
                        transition: all 0.2s ease;
                        animation: fadeIn 0.3s ease forwards;
                    }

                    .emails-grid-row-minimal:hover {
                        background: rgba(30, 41, 59, 0.2);
                    }

                    .recipient-col-minimal {
                        font-size: 13px;
                        color: #00d9ff;
                    }

                    .subject-col-minimal {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        padding-right: 20px;
                    }

                    .subject-text-minimal {
                        font-weight: 700;
                        color: #ffffff;
                        font-size: 14px;
                    }

                    .error-text-minimal {
                        font-size: 11px;
                        color: #ef4444;
                    }

                    .type-col-minimal {
                        display: flex;
                    }

                    .type-badge-minimal {
                        font-size: 10px;
                        padding: 4px 10px;
                        background: rgba(15, 23, 42, 0.5);
                        color: #94a3b8;
                        border-radius: 6px;
                        text-transform: uppercase;
                        font-weight: 700;
                        border: 1px solid #1e293b;
                    }

                    .status-col-minimal {
                        display: flex;
                        align-items: center;
                    }

                    .status-badge-minimal {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .status-label-minimal {
                        font-size: 12px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.02em;
                    }

                    .status-label-minimal.sent { color: #10b981; }
                    .status-label-minimal.failed { color: #ef4444; }
                    .status-label-minimal.sending { color: #f59e0b; }
                    .status-label-minimal.pending { color: #0ea5e9; }

                    .attempts-col-minimal {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }

                    .attempts-count-minimal {
                        font-weight: 700;
                        font-size: 14px;
                    }

                    .attempts-max-minimal {
                        color: #64748b;
                        font-size: 12px;
                    }

                    .created-col-minimal {
                        font-size: 13px;
                        color: #64748b;
                        font-weight: 500;
                    }

                    .actions-col-minimal {
                        display: flex;
                        gap: 8px;
                        justify-content: flex-end;
                    }

                    .action-btn-minimal {
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: transparent;
                        color: #94a3b8;
                        border-radius: 8px;
                        border: 1px solid #1e293b;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                        cursor: pointer;
                    }

                    .action-btn-minimal:hover {
                        color: #ffffff;
                        background: #1e293b;
                        transform: translateY(-2px);
                    }

                    .action-btn-minimal.danger:hover {
                        background: rgba(239, 68, 68, 0.1);
                        color: #ef4444;
                        border-color: rgba(239, 68, 68, 0.2);
                    }

                    .pagination-minimal {
                        padding: 32px 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 20px;
                    }

                    .pagination-btn-minimal {
                        padding: 8px 16px;
                        background: transparent;
                        color: #94a3b8;
                        border: 1px solid #1e293b;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .pagination-btn-minimal:hover:not(:disabled) {
                        background: #1e293b;
                        color: #ffffff;
                    }

                    .pagination-btn-minimal:disabled {
                        opacity: 0.4;
                        cursor: not-allowed;
                    }

                    .pagination-info-minimal {
                        font-size: 14px;
                        color: #64748b;
                    }

                    .pagination-info-minimal strong {
                        color: #ffffff;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                ` }} />
            </div>

            {/* Email View Modal */}
            {selectedEmail && (
                <div className="modal-overlay" onClick={() => setSelectedEmail(null)}>
                    <div className="modal-content" style={{ maxWidth: '800px', width: '90%', height: '85vh' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Email Preview</h2>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                    Sent to: <span style={{ color: 'var(--color-cyan-primary)' }}>{selectedEmail.to}</span>
                                </p>
                            </div>
                            <button onClick={() => setSelectedEmail(null)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ background: '#f5f5f5', flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '12px 20px', background: 'white', borderBottom: '1px solid #eee' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Subject: {selectedEmail.subject}</div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f5f5f5' }}>
                                <iframe
                                    title="Email Preview"
                                    srcDoc={`
                                        <!DOCTYPE html>
                                        <html>
                                            <head>
                                                <style>
                                                    body { 
                                                        margin: 0; 
                                                        padding: 20px; 
                                                        background: white; 
                                                        font-family: Arial, sans-serif; 
                                                        color: #333;
                                                    }
                                                    h1, h2, h3, h4 { margin-top: 0; }
                                                </style>
                                            </head>
                                            <body>
                                                ${selectedEmail.html}
                                            </body>
                                        </html>
                                    `}
                                    style={{
                                        width: '100%',
                                        maxWidth: '600px',
                                        height: '100%',
                                        minHeight: '500px',
                                        margin: '0 auto',
                                        display: 'block',
                                        border: 'none',
                                        backgroundColor: 'white',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', background: 'var(--color-bg-card)' }}>
                            <button onClick={() => setSelectedEmail(null)} className="btn-secondary">Close Preview</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailQueue;
