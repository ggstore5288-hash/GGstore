import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import { ShoppingCart, Search, Eye, Filter } from 'lucide-react';
import Pagination from '../../components/Pagination.jsx';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getOrders(page, 10, statusFilter !== 'all' ? statusFilter : undefined);
            setOrders(data.orders || []);
            setTotalPages(data.pages || 1);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title">Orders</h1>
            </div>

            {/* Controls */}
            <div className="admin-card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <Filter size={18} color="var(--color-text-muted)" />
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            background: 'var(--color-bg-primary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)',
                            minWidth: '200px'
                        }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders List */}
            <div className="card-title" style={{
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <ShoppingCart size={20} color="var(--color-primary)" style={{ marginRight: '12px' }} />
                <span style={{
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                }}>
                    Recent Orders
                </span>
            </div>

            <div className="orders-table-wrapper" style={{ overflowX: 'auto', width: '100%', marginBottom: '32px' }}>
                <div className="orders-grid-minimal" style={{ minWidth: '1000px' }}>
                    {/* Header */}
                    <div className="orders-grid-header-minimal">
                        <div>Order ID</div>
                        <div>Customer</div>
                        <div>Date</div>
                        <div>Total</div>
                        <div>Payment</div>
                        <div>Status</div>
                        <div style={{ textAlign: 'right' }}>Actions</div>
                    </div>

                    {/* Body */}
                    <div className="orders-grid-body-minimal">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
                                Loading orders...
                            </div>
                        ) : orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
                                No orders found.
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order._id} className="orders-grid-row-minimal">
                                    <div style={{ fontFamily: 'monospace', color: 'var(--color-cyan-primary)', fontWeight: 'bold' }}>
                                        #{order.orderNumber}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>
                                            {order.customerInfo?.name || order.user?.name || 'Guest'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={order.customerInfo?.email || order.user?.email}>
                                            {order.customerInfo?.email || order.user?.email}
                                        </div>
                                    </div>
                                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                                        {formatDate(order.createdAt)}
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: 'white' }}>
                                        {formatCurrency(order.total)}
                                    </div>
                                    <div>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            background: order.paymentStatus === 'confirmed' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                                            color: order.paymentStatus === 'confirmed' ? '#4ade80' : '#facc15',
                                            border: `1px solid ${order.paymentStatus === 'confirmed' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(250, 204, 21, 0.3)'}`
                                        }}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                    <div>
                                        <select
                                            value={order.orderStatus}
                                            onChange={async (e) => {
                                                const newStatus = e.target.value;
                                                const updatedOrders = orders.map(o => o._id === order._id ? { ...o, orderStatus: newStatus } : o);
                                                setOrders(updatedOrders);
                                                try {
                                                    await adminAPI.updateOrderStatus(order._id, newStatus);
                                                } catch (err) {
                                                    console.error('Update failed', err);
                                                    fetchOrders();
                                                }
                                            }}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--color-border)',
                                                background: 'var(--color-bg-primary)',
                                                color: 'white',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                width: '130px'
                                            }}
                                        >
                                            <option value="new">New</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <button
                                            className="icon-btn-minimal"
                                            title="View Details"
                                            style={{
                                                padding: '8px',
                                                background: 'transparent',
                                                border: '1px solid #1e293b',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                color: 'var(--color-text-secondary)',
                                                transition: 'all 0.2s'
                                            }}
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {!loading && totalPages > 1 && (
                        <div style={{ padding: '32px 0 20px', display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .orders-grid-minimal {
                    display: flex;
                    flex-direction: column;
                    font-family: 'Inter', sans-serif;
                }

                .orders-grid-header-minimal {
                    display: grid;
                    grid-template-columns: 120px 2fr 1.5fr 100px 120px 150px 80px;
                    padding: 12px 0;
                    color: #94a3b8;
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 2px solid #1e293b;
                }

                .orders-grid-row-minimal {
                    display: grid;
                    grid-template-columns: 120px 2fr 1.5fr 100px 120px 150px 80px;
                    padding: 16px 0;
                    align-items: center;
                    border-bottom: 1px solid #1e293b;
                    transition: all 0.2s ease;
                }

                .orders-grid-row-minimal:hover {
                    background: rgba(30, 41, 59, 0.2);
                }

                .icon-btn-minimal:hover {
                    color: #ffffff !important;
                    background: #1e293b !important;
                    transform: translateY(-2px);
                }
            `}</style>

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={fetchOrders}
                />
            )}
        </div>
    );
};

export default Orders;
