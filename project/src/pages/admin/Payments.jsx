import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import client from '../../api/client';
import { DollarSign, Filter, Eye, CheckCircle, XCircle, Search } from 'lucide-react';
import Pagination from '../../components/Pagination.jsx';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUtils';

const Payments = () => {
    const { addToast } = useToast();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, [page, statusFilter]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getAllPayments(page, 10, statusFilter);
            setPayments(data.payments || []);
            setTotalPages(data.pagination?.pages || 1);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            addToast('Failed to load payments', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (payment) => {
        if (!payment?._id) return;
        try {
            await adminAPI.confirmPayment(payment._id);
            addToast('Payment confirmed', 'success');
            fetchPayments();
        } catch (error) {
            addToast(error.response?.data?.message || 'Confirmation failed', 'error');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title">Payments</h1>
            </div>

            {/* Controls */}
            <div className="filters-container" style={{ marginBottom: '32px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(30, 41, 59, 0.5)', padding: '8px 16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <Filter size={18} color="#94a3b8" />
                    <select
                        className="form-select-minimal"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            outline: 'none',
                            cursor: 'pointer',
                            minWidth: '140px'
                        }}
                    >
                        <option value="" style={{ background: '#0f172a' }}>All Statuses</option>
                        <option value="pending" style={{ background: '#0f172a' }}>Pending</option>
                        <option value="confirmed" style={{ background: '#0f172a' }}>Confirmed</option>
                        <option value="rejected" style={{ background: '#0f172a' }}>Rejected</option>
                    </select>
                </div>
            </div>

            {/* Payments List */}
            <div className="payments-table-wrapper" style={{ overflowX: 'auto', width: '100%', marginBottom: '32px' }}>
                <div className="payments-list-minimal" style={{ minWidth: '1100px' }}>
                    {/* Grid Header */}
                    <div className="payments-grid-header-minimal">
                        <div>Date</div>
                        <div>User</div>
                        <div>Order</div>
                        <div>Method</div>
                        <div style={{ textAlign: 'center' }}>Amount</div>
                        <div style={{ textAlign: 'center' }}>Proof</div>
                        <div style={{ textAlign: 'center' }}>Status</div>
                        <div style={{ textAlign: 'center' }}>Actions</div>
                    </div>

                    {/* Grid Body */}
                    <div className="payments-grid-body-minimal">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '15px' }}>
                                <div className="loading-spinner-minimal"></div>
                                Loading payments...
                            </div>
                        ) : payments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '15px' }}>
                                No payments found.
                            </div>
                        ) : (
                            payments.map((payment) => (
                                <div key={payment._id} className="payments-grid-row-minimal">
                                    {/* Date Column */}
                                    <div className="date-col-minimal">
                                        {formatDate(payment.createdAt)}
                                    </div>

                                    {/* User Column */}
                                    <div className="user-col-minimal">
                                        <div className="user-name-minimal">{payment.user?.name}</div>
                                        <div className="user-email-minimal">{payment.user?.email}</div>
                                    </div>

                                    {/* Order Column */}
                                    <div className="order-col-minimal">
                                        <span className="order-number-minimal">#{payment.order?.orderNumber}</span>
                                    </div>

                                    {/* Method Column */}
                                    <div className="method-col-minimal">
                                        <div className="method-name-minimal">{payment.method}</div>
                                        <div className="method-phone-minimal">{payment.phoneNumber}</div>
                                    </div>

                                    {/* Amount Column */}
                                    <div style={{ textAlign: 'center' }}>
                                        <span className="amount-value-minimal">${payment.order?.total}</span>
                                    </div>

                                    {/* Proof Column */}
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        {payment.proofImage && (
                                            <div className="proof-image-container-minimal">
                                                <img
                                                    src={getImageUrl(payment.proofImage)}
                                                    alt="Proof"
                                                    className="proof-thumb-minimal"
                                                    onClick={() => window.open(getImageUrl(payment.proofImage), '_blank')}
                                                    title="Click to view full image"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Column */}
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <span className={`status-pill ${payment.status}`}>
                                            <span className="status-dot"></span>
                                            {payment.status}
                                        </span>
                                    </div>

                                    {/* Actions Column */}
                                    <div className="actions-col-minimal">
                                        <button
                                            className="action-btn-minimal"
                                            title="View Details"
                                            onClick={async () => {
                                                if (!payment.order?._id) {
                                                    addToast('Order ID not found', 'error');
                                                    return;
                                                }
                                                try {
                                                    const response = await client.get(`/orders/${payment.order._id}`);
                                                    const fullOrder = response.data.data.order;
                                                    setSelectedOrder({ ...fullOrder, payment });
                                                } catch (e) {
                                                    console.error('Failed to fetch order:', e);
                                                    addToast('Failed to load order details', 'error');
                                                }
                                            }}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        {payment.status === 'pending' && (
                                            <>
                                                <button
                                                    className="action-btn-minimal success"
                                                    title="Confirm Payment"
                                                    onClick={() => handleConfirm(payment)}
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button
                                                    className="action-btn-minimal danger"
                                                    title="Reject Payment"
                                                    onClick={async () => {
                                                        if (window.confirm('Reject this payment?')) {
                                                            await adminAPI.rejectPayment(payment._id);
                                                            fetchPayments();
                                                        }
                                                    }}
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {!loading && totalPages > 1 && (
                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}

                    <style dangerouslySetInnerHTML={{
                        __html: `
                    .payments-list-minimal {
                        margin-top: 16px;
                        font-family: 'Inter', sans-serif;
                    }

                    .payments-grid-header-minimal {
                        display: grid;
                        grid-template-columns: 1.5fr 2fr 1.5fr 1.2fr 1fr 1fr 1.2fr 1.5fr;
                        padding: 12px 0;
                        color: #94a3b8;
                        font-size: 13px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        border-bottom: 2px solid #1e293b;
                    }

                    .payments-grid-row-minimal {
                        display: grid;
                        grid-template-columns: 1.5fr 2fr 1.5fr 1.2fr 1fr 1fr 1.2fr 1.5fr;
                        padding: 16px 0;
                        align-items: center;
                        border-bottom: 1px solid #1e293b;
                        transition: all 0.2s ease;
                    }

                    .payments-grid-row-minimal:hover {
                        background: rgba(30, 41, 59, 0.2);
                    }

                    .date-col-minimal {
                        color: #94a3b8;
                        font-size: 13px;
                    }

                    .user-name-minimal {
                        color: #f1f5f9;
                        font-weight: 700;
                        font-size: 15px;
                    }

                    .user-email-minimal {
                        color: #64748b;
                        font-size: 12px;
                    }

                    .order-number-minimal {
                        color: #00d9ff;
                        font-family: 'JetBrains Mono', monospace;
                        font-weight: 600;
                        font-size: 13px;
                    }

                    .method-name-minimal {
                        color: #94a3b8;
                        font-weight: 700;
                        text-transform: uppercase;
                        font-size: 12px;
                    }

                    .method-phone-minimal {
                        color: #64748b;
                        font-size: 12px;
                    }

                    .amount-value-minimal {
                        color: #ffffff;
                        font-weight: 800;
                        font-size: 16px;
                    }

                    .proof-image-container-minimal {
                        position: relative;
                        width: 40px;
                        height: 40px;
                    }

                    .proof-thumb-minimal {
                        width: 40px;
                        height: 40px;
                        object-fit: cover;
                        border-radius: 6px;
                        cursor: pointer;
                        border: 1px solid #1e293b;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .proof-thumb-minimal:hover {
                        transform: scale(1.1);
                        border-color: #00d9ff;
                        box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
                        z-index: 10;
                    }

                    .status-pill {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 6px 16px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }

                    .status-pill.confirmed {
                        background: rgba(16, 185, 129, 0.1);
                        color: #10b981;
                        border: 1px solid rgba(16, 185, 129, 0.2);
                    }

                    .status-pill.pending {
                        background: rgba(245, 158, 11, 0.1);
                        color: #f59e0b;
                        border: 1px solid rgba(245, 158, 11, 0.2);
                    }

                    .status-pill.rejected {
                        background: rgba(239, 68, 68, 0.1);
                        color: #ef4444;
                        border: 1px solid rgba(239, 68, 68, 0.2);
                    }

                    .status-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: currentColor;
                        box-shadow: 0 0 8px currentColor;
                    }

                    .actions-col-minimal {
                        display: flex;
                        gap: 10px;
                        justify-content: center;
                    }

                    .action-btn-minimal {
                        width: 38px;
                        height: 38px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: transparent;
                        color: #94a3b8;
                        border-radius: 10px;
                        border: 1px solid #1e293b;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .action-btn-minimal:hover {
                        background: #1e293b;
                        color: white;
                        transform: translateY(-2px);
                    }

                    .action-btn-minimal.success:hover {
                        background: #10b981;
                        border-color: #10b981;
                        box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
                    }

                    .action-btn-minimal.danger:hover {
                        background: #ef4444;
                        border-color: #ef4444;
                        box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
                    }

                    .loading-spinner-minimal {
                        width: 24px;
                        height: 24px;
                        border: 3px solid rgba(0, 217, 255, 0.1);
                        border-top-color: #00d9ff;
                        border-radius: 50%;
                        margin: 0 auto 12px;
                        animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                ` }} />
                </div>

                {/* Reusing the Modal, but note: payment.order in the list might not have 'Items' populated from getAllPayments backend!
                So products list might be empty. This is an acceptable tradeoff for now to speed up payment review.
            */}
                {selectedOrder && (
                    <OrderDetailsModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onUpdate={fetchPayments}
                    />
                )}
            </div>
        </div>
    );
};

export default Payments;
