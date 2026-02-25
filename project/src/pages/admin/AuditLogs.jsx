import React, { useState, useEffect } from 'react';
import { FileText, Filter, Eye, Calendar, User, Activity, X } from 'lucide-react';
import adminAPI from '../../api/admin';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        user: '',
        action: '',
        resource: '',
        startDate: '',
        endDate: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        loadLogs();
    }, [page, filters]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 50, ...filters };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });
            const result = await adminAPI.getAuditLogs(params);
            setLogs(result?.data?.auditLogs || result?.auditLogs || []);
            setTotalPages(result?.data?.pagination?.totalPages || result?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({
            user: '',
            action: '',
            resource: '',
            startDate: '',
            endDate: ''
        });
        setPage(1);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionColor = (action) => {
        const colors = {
            create: '#00ff80',
            update: '#ffc800',
            delete: '#ff6464',
            read: '#00d2ff',
            list: '#00d2ff',
            view: '#00d2ff',
            confirm: '#00ff80',
            reject: '#ff6464',
            reorder: '#a855f7',
            retry: '#00a3ff'
        };
        return colors[action?.toLowerCase()] || '#888';
    };

    const renderChanges = (changes) => {
        if (!changes) return <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No direct data changes captured.</p>;

        const renderValue = (val) => {
            if (val === null || val === undefined) return 'N/A';
            if (typeof val === 'boolean') return val ? 'Yes' : 'No';
            if (typeof val === 'object') return JSON.stringify(val);
            return val.toString();
        };

        // If it's a create, show created fields
        if (changes.created) {
            return (
                <div className="changes-grid">
                    <div style={{ marginBottom: '12px', color: '#00ff80', fontWeight: 'bold', fontSize: '13px' }}>Resource Created with:</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <tbody>
                            {Object.entries(changes.created).map(([key, value]) => (
                                <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-muted)', width: '30%' }}>{key}</td>
                                    <td style={{ padding: '8px 0', color: '#fff' }}>{renderValue(value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // If it's an update, show fields updated
        if (changes.body || changes.updatedFields) {
            const fields = changes.updatedFields || Object.keys(changes.body || {});
            return (
                <div className="changes-grid">
                    <div style={{ marginBottom: '12px', color: '#ffc800', fontWeight: 'bold', fontSize: '13px' }}>Modified Fields:</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <tbody>
                            {fields.map(field => (
                                <tr key={field} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-muted)', width: '30%' }}>{field}</td>
                                    <td style={{ padding: '8px 0', color: '#fff' }}>
                                        {changes.body ? renderValue(changes.body[field]) : 'Updated'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        return <pre style={{ fontSize: '12px', color: '#888' }}>{JSON.stringify(changes, null, 2)}</pre>;
    };

    const displayIP = (ip) => {
        if (!ip) return '-';
        if (ip === '::1' || ip === '127.0.0.1' || ip.includes('::ffff:127.0.0.1')) return 'Localhost';
        return ip.replace('::ffff:', '');
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Audit Logs</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Track all administrative actions, users, and IP addresses
                    </p>
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary">
                    <Filter size={18} />
                    Filters
                </button>
            </header>

            {/* Filters Panel */}
            {showFilters && (
                <div style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Action</label>
                            <select
                                className="form-select"
                                value={filters.action}
                                onChange={e => handleFilterChange('action', e.target.value)}
                            >
                                <option value="">All Actions</option>
                                <option value="create">Create</option>
                                <option value="update">Update</option>
                                <option value="delete">Delete</option>
                                <option value="list">List</option>
                                <option value="view">View</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Resource</label>
                            <select
                                className="form-select"
                                value={filters.resource}
                                onChange={e => handleFilterChange('resource', e.target.value)}
                            >
                                <option value="">All Resources</option>
                                <option value="product">Product</option>
                                <option value="order">Order</option>
                                <option value="user">User</option>
                                <option value="category">Category</option>
                                <option value="promo_code">Promo Code</option>
                                <option value="payment">Payment</option>
                                <option value="settings">Settings</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Start Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.startDate}
                                onChange={e => handleFilterChange('startDate', e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>End Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.endDate}
                                onChange={e => handleFilterChange('endDate', e.target.value)}
                            />
                        </div>
                    </div>
                    <button onClick={clearFilters} className="btn-secondary" style={{ marginTop: '16px' }}>
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Audit Logs Table */}
            <div className="audit-logs-minimal">
                <div className="audit-logs-grid-container-minimal">
                    {/* Grid Header */}
                    <div className="audit-logs-grid-header-minimal">
                        <div style={{ textAlign: 'left' }}>DATE</div>
                        <div style={{ textAlign: 'left' }}>ADMIN USER</div>
                        <div style={{ textAlign: 'center' }}>ACTION</div>
                        <div style={{ textAlign: 'left' }}>RESOURCE</div>
                        <div style={{ textAlign: 'left' }}>IP ADDRESS</div>
                        <div style={{ textAlign: 'center' }}>STATUS</div>
                        <div style={{ textAlign: 'center' }}>ACTIONS</div>
                    </div>

                    {/* Grid Body */}
                    <div className="audit-logs-grid-body-minimal">
                        {loading ? (
                            <div className="empty-state" style={{ padding: '60px' }}>Loading audit logs...</div>
                        ) : logs.length === 0 ? (
                            <div className="empty-state" style={{ textAlign: 'center', padding: '80px 20px' }}>
                                <FileText size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                                <p style={{ color: 'var(--color-text-muted)' }}>No audit logs found.</p>
                            </div>
                        ) : (
                            <>
                                {logs.map((log, index) => (
                                    <div
                                        key={log._id}
                                        className="audit-logs-grid-row-minimal"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        {/* Date */}
                                        <div className="date-col-minimal">
                                            {formatDate(log.createdAt)}
                                        </div>

                                        {/* Admin User */}
                                        <div className="user-col-minimal">
                                            <div className="user-avatar-minimal">
                                                {log.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="user-info-minimal">
                                                <div className="user-name-minimal">{log.user?.name || 'Unknown User'}</div>
                                                <div className="user-email-minimal">{log.user?.email || '-'}</div>
                                            </div>
                                        </div>

                                        {/* Action Badge */}
                                        <div className="action-col-minimal">
                                            <span className="action-badge-pill-minimal" style={{
                                                background: `${getActionColor(log.action)}20`,
                                                color: getActionColor(log.action),
                                                borderColor: `${getActionColor(log.action)}30`
                                            }}>
                                                {log.action}
                                            </span>
                                        </div>

                                        {/* Resource */}
                                        <div className="resource-col-minimal">
                                            <div className="resource-name-minimal">{log.resource || '-'}</div>
                                            <div className="resource-id-minimal">
                                                {log.resourceId ? '#' + log.resourceId.toString().substring(0, 8) : '-'}
                                            </div>
                                        </div>

                                        {/* IP Address */}
                                        <div className="ip-col-minimal">
                                            <div className="ip-text-minimal">{displayIP(log.ipAddress)}</div>
                                            {log.location && log.location.city !== 'Localhost' && (
                                                <div className="location-text-minimal">
                                                    {log.location.city}, {log.location.countryCode}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className="status-col-minimal">
                                            <span className={`status-pill-minimal ${log.status === 'success' ? 'success' : 'error'}`}>
                                                {log.status === 'failure' ? 'Error' : 'Success'}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="actions-col-minimal">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="log-action-btn-minimal"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
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
                    .audit-logs-minimal {
                        font-family: 'Inter', sans-serif;
                    }

                    .audit-logs-grid-header-minimal {
                        display: grid;
                        grid-template-columns: 1.5fr 2.5fr 1fr 1.2fr 1.2fr 1fr 80px;
                        padding: 12px 0;
                        color: #64748b;
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        border-bottom: 2px solid #1e293b;
                    }

                    .audit-logs-grid-row-minimal {
                        display: grid;
                        grid-template-columns: 1.5fr 2.5fr 1fr 1.2fr 1.2fr 1fr 80px;
                        padding: 16px 0;
                        align-items: center;
                        border-bottom: 1px solid #1e293b;
                        transition: background 0.2s;
                        animation: fadeIn 0.3s ease forwards;
                    }

                    .audit-logs-grid-row-minimal:hover {
                        background: rgba(30, 41, 59, 0.2);
                    }

                    .date-col-minimal {
                        font-size: 12px;
                        color: #64748b;
                    }

                    .user-col-minimal {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }

                    .user-avatar-minimal {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        background: rgba(0, 217, 255, 0.1);
                        color: #00d9ff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: 700;
                        border: 1px solid rgba(0, 217, 255, 0.2);
                    }

                    .user-info-minimal {
                        display: flex;
                        flex-direction: column;
                    }

                    .user-name-minimal {
                        font-weight: 700;
                        color: #ffffff;
                        font-size: 14px;
                    }

                    .user-email-minimal {
                        font-size: 11px;
                        color: #64748b;
                    }

                    .action-col-minimal {
                        display: flex;
                        justify-content: center;
                    }

                    .action-badge-pill-minimal {
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 10px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.02em;
                        border: 1px solid transparent;
                    }

                    .resource-col-minimal {
                        display: flex;
                        flex-direction: column;
                    }

                    .resource-name-minimal {
                        color: #cbd5e1;
                        font-weight: 600;
                        font-size: 13px;
                        text-transform: capitalize;
                    }

                    .resource-id-minimal {
                        font-family: monospace;
                        font-size: 10px;
                        color: #64748b;
                        letter-spacing: 0.02em;
                    }

                    .ip-col-minimal {
                        display: flex;
                        flex-direction: column;
                    }

                    .ip-text-minimal {
                        font-family: monospace;
                        font-size: 12px;
                        color: #94a3b8;
                    }

                    .location-text-minimal {
                        font-size: 10px;
                        color: #00d9ff;
                        font-weight: 500;
                    }

                    .status-col-minimal {
                        display: flex;
                        justify-content: center;
                    }

                    .status-pill-minimal {
                        font-size: 10px;
                        font-weight: 800;
                        text-transform: uppercase;
                        padding: 4px 10px;
                        border-radius: 20px;
                        letter-spacing: 0.02em;
                    }

                    .status-pill-minimal.success {
                        background: rgba(16, 185, 129, 0.1);
                        color: #10b981;
                    }

                    .status-pill-minimal.error {
                        background: rgba(239, 68, 68, 0.1);
                        color: #ef4444;
                    }

                    .actions-col-minimal {
                        display: flex;
                        justify-content: center;
                    }

                    .log-action-btn-minimal {
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: transparent;
                        color: #94a3b8;
                        border-radius: 8px;
                        border: 1px solid #1e293b;
                        transition: all 0.2s;
                        cursor: pointer;
                    }

                    .log-action-btn-minimal:hover {
                        background: #1e293b;
                        color: #ffffff;
                        transform: translateY(-2px);
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

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh' }}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Activity Details</h2>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Log ID: {selectedLog._id}</p>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                                <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <User size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> PERFORMED BY
                                    </h4>
                                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{selectedLog.user?.name || 'Unknown'}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        {selectedLog.user?.email || '-'}
                                    </div>
                                    <div style={{
                                        marginTop: '12px',
                                        fontSize: '11px',
                                        padding: '4px 8px',
                                        background: 'rgba(0, 210, 255, 0.1)',
                                        color: '#00d2ff',
                                        borderRadius: '4px',
                                        display: 'inline-block'
                                    }}>
                                        Role: {selectedLog.user?.role || 'admin'}
                                    </div>
                                </div>

                                <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <Activity size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> ACTION & RESOURCE
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: `${getActionColor(selectedLog.action)}20`,
                                            color: getActionColor(selectedLog.action),
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}>
                                            {selectedLog.action}
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: '15px', textTransform: 'capitalize' }}>
                                            {selectedLog.resource}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '12px', fontSize: '12px' }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Target ID:</span>
                                        <code style={{ marginLeft: '8px', color: 'var(--color-cyan-primary)' }}>
                                            {selectedLog.resourceId || 'N/A'}
                                        </code>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> TIME & LOCATION
                                    </h4>
                                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{formatDate(selectedLog.createdAt)}</div>
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>IP:</span>
                                            <code style={{ fontSize: '13px' }}>{displayIP(selectedLog.ipAddress)}</code>
                                            {selectedLog.ipAddress && selectedLog.ipAddress !== '::1' && (
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${selectedLog.location?.lat},${selectedLog.location?.lon}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ fontSize: '10px', color: 'var(--color-cyan-primary)', textDecoration: 'underline' }}
                                                >
                                                    View on Map
                                                </a>
                                            )}
                                        </div>
                                        {selectedLog.location && selectedLog.location.city !== 'Localhost' && (
                                            <div style={{ fontSize: '12px', color: 'var(--color-cyan-primary)', marginTop: '4px', fontWeight: 500 }}>
                                                📍 {selectedLog.location.city}, {selectedLog.location.country}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Status:</span>
                                            <span style={{
                                                fontSize: '11px',
                                                color: selectedLog.status === 'success' ? '#00ff80' : '#ff6464',
                                                fontWeight: 'bold'
                                            }}>
                                                {selectedLog.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Visualization */}
                            {selectedLog.location && selectedLog.location.lat && (
                                <div style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', height: '200px' }}>
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        marginHeight="0"
                                        marginWidth="0"
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLog.location.lon - 0.1},${selectedLog.location.lat - 0.1},${selectedLog.location.lon + 0.1},${selectedLog.location.lat + 0.1}&layer=mapnik&marker=${selectedLog.location.lat},${selectedLog.location.lon}`}
                                        style={{ border: 0 }}
                                    ></iframe>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                                {selectedLog.method && selectedLog.endpoint && (
                                    <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '12px' }}>
                                        <h4 style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            Technical Endpoint
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                background: 'var(--color-bg-card)',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                fontFamily: 'monospace',
                                                color: 'var(--color-cyan-primary)'
                                            }}>
                                                {selectedLog.method}
                                            </span>
                                            <code style={{ fontFamily: 'monospace', fontSize: '13px', opacity: 0.9 }}>
                                                {selectedLog.endpoint}
                                            </code>
                                        </div>
                                    </div>
                                )}

                                {selectedLog.changes && (
                                    <div style={{ padding: '20px', background: 'var(--color-bg-secondary)', borderRadius: '12px' }}>
                                        <h4 style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            Business Data Changes (Simplified)
                                        </h4>
                                        <div style={{
                                            background: 'var(--color-bg-card)',
                                            borderRadius: '8px',
                                            padding: '20px',
                                            border: '1px solid var(--color-border)'
                                        }}>
                                            {renderChanges(selectedLog.changes)}
                                        </div>

                                        <details style={{ marginTop: '20px' }}>
                                            <summary style={{ fontSize: '12px', cursor: 'pointer', color: 'var(--color-text-muted)' }}>Show Raw JSON Payload (Technical)</summary>
                                            <div style={{
                                                background: '#0a0a0c',
                                                borderRadius: '8px',
                                                padding: '16px',
                                                fontFamily: 'monospace',
                                                fontSize: '11px',
                                                marginTop: '12px',
                                                overflowX: 'auto',
                                                border: '1px solid #333'
                                            }}>
                                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#00ff80' }}>
                                                    {JSON.stringify(selectedLog.changes, null, 2)}
                                                </pre>
                                            </div>
                                        </details>
                                    </div>
                                )}

                                {selectedLog.errorMessage && (
                                    <div style={{ padding: '16px', background: 'rgba(255, 100, 100, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 100, 100, 0.2)' }}>
                                        <h4 style={{ color: '#ff6464', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            Error Details
                                        </h4>
                                        <p style={{ fontSize: '13px', color: '#ff6464', fontFamily: 'monospace' }}>{selectedLog.errorMessage}</p>
                                    </div>
                                )}

                                {selectedLog.userAgent && (
                                    <div style={{ padding: '16px', opacity: 0.7 }}>
                                        <h4 style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            Browser User Agent
                                        </h4>
                                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace', lineHeight: '1.4' }}>
                                            {selectedLog.userAgent}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', background: 'var(--color-bg-card)' }}>
                            <button onClick={() => setSelectedLog(null)} className="btn-secondary">
                                Close Details
                            </button>
                        </div>
                    </div>
                </div >
            )}
        </div >
    );
};

export default AuditLogs;
