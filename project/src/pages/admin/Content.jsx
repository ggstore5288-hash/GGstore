import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Image as ImageIcon, Star } from 'lucide-react';
import adminAPI from '../../api/admin';
import { getImageUrl } from '../../utils/imageUtils';

const Content = () => {
    const [activeTab, setActiveTab] = useState('banners');
    const [banners, setBanners] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [editingFeatured, setEditingFeatured] = useState(null);
    const [bannerFormData, setBannerFormData] = useState({
        title: '',
        link: '',
        position: 'homepage',
        order: 0,
        isActive: true,
        image: null
    });
    const [featuredFormData, setFeaturedFormData] = useState({
        productId: '',
        section: 'featured',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'banners') {
                const result = await adminAPI.getAllBannersAdmin();
                setBanners(result?.data?.banners || []);
            } else {
                const [featuredRes, productsRes] = await Promise.all([
                    adminAPI.getAllFeaturedAdmin(),
                    adminAPI.getProducts(1, 1000)
                ]);
                setFeaturedProducts(featuredRes?.data?.featuredProducts || []);
                setProducts(productsRes?.products || []);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBannerEdit = (banner) => {
        setEditingBanner(banner);
        setBannerFormData({
            title: banner.title || '',
            link: banner.link || '',
            position: banner.position || 'homepage',
            order: banner.order || 0,
            isActive: banner.isActive !== undefined ? banner.isActive : true,
            image: null
        });
        setIsBannerModalOpen(true);
    };

    const handleBannerAdd = () => {
        setEditingBanner(null);
        setBannerFormData({
            title: '',
            link: '',
            position: 'homepage',
            order: banners.length,
            isActive: true,
            image: null
        });
        setIsBannerModalOpen(true);
    };

    const handleBannerDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await adminAPI.deleteBanner(id);
                loadData();
            } catch (error) {
                alert('Failed to delete banner: ' + error.message);
            }
        }
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('title', bannerFormData.title);
            if (bannerFormData.link) data.append('link', bannerFormData.link);
            data.append('position', bannerFormData.position);
            data.append('order', bannerFormData.order);
            data.append('isActive', bannerFormData.isActive);
            if (bannerFormData.image) data.append('bannerImage', bannerFormData.image);

            if (editingBanner) {
                await adminAPI.updateBanner(editingBanner._id, data);
            } else {
                await adminAPI.createBanner(data);
            }
            setIsBannerModalOpen(false);
            loadData();
        } catch (error) {
            alert('Failed to save banner: ' + error.message);
        }
    };

    const handleFeaturedAdd = () => {
        setEditingFeatured(null);
        setFeaturedFormData({
            productId: '',
            section: 'featured',
            order: featuredProducts.length,
            isActive: true
        });
        setIsFeaturedModalOpen(true);
    };

    const handleFeaturedEdit = (featured) => {
        setEditingFeatured(featured);
        setFeaturedFormData({
            productId: featured.product?._id || featured.product || '',
            section: featured.section || 'featured',
            order: featured.order || 0,
            isActive: featured.isActive !== undefined ? featured.isActive : true
        });
        setIsFeaturedModalOpen(true);
    };

    const handleFeaturedDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this featured product?')) {
            try {
                await adminAPI.removeFeaturedProduct(id);
                loadData();
            } catch (error) {
                alert('Failed to remove featured product: ' + error.message);
            }
        }
    };

    const handleFeaturedSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFeatured) {
                await adminAPI.updateFeaturedProduct(editingFeatured._id, featuredFormData);
            } else {
                await adminAPI.addFeaturedProduct(featuredFormData);
            }
            setIsFeaturedModalOpen(false);
            loadData();
        } catch (error) {
            alert('Failed to save featured product: ' + error.message);
        }
    };

    const handleBannerReorder = async (bannerId, direction) => {
        const banner = banners.find(b => b._id === bannerId);
        if (!banner) return;

        const currentIndex = banners.findIndex(b => b._id === bannerId);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= banners.length) return;

        const newBanners = [...banners];
        [newBanners[currentIndex], newBanners[newIndex]] = [newBanners[newIndex], newBanners[currentIndex]];

        const bannerOrders = newBanners.map((b, idx) => ({
            bannerId: b._id,
            order: idx
        }));

        try {
            await adminAPI.reorderBanners({ bannerOrders });
            loadData();
        } catch (error) {
            alert('Failed to reorder banners: ' + error.message);
        }
    };

    const handleFeaturedReorder = async (featuredId, direction) => {
        const featured = featuredProducts.find(f => f._id === featuredId);
        if (!featured) return;

        const currentIndex = featuredProducts.findIndex(f => f._id === featuredId);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= featuredProducts.length) return;

        const newFeatured = [...featuredProducts];
        [newFeatured[currentIndex], newFeatured[newIndex]] = [newFeatured[newIndex], newFeatured[currentIndex]];

        const featuredOrders = newFeatured.map((f, idx) => ({
            featuredId: f._id,
            order: idx
        }));

        try {
            await adminAPI.reorderFeatured({ featuredOrders });
            loadData();
        } catch (error) {
            alert('Failed to reorder featured products: ' + error.message);
        }
    };

    const sortedBanners = [...banners].sort((a, b) => (a.order || 0) - (b.order || 0));
    const sortedFeatured = [...featuredProducts].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Content Management</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Manage banners and featured products
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {activeTab === 'banners' ? (
                        <button onClick={handleBannerAdd} className="btn-primary">
                            <Plus size={18} />
                            Add Banner
                        </button>
                    ) : (
                        <button onClick={handleFeaturedAdd} className="btn-primary">
                            <Plus size={18} />
                            Add Featured Product
                        </button>
                    )}
                </div>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)' }}>
                <button
                    onClick={() => setActiveTab('banners')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'banners' ? 'var(--color-bg-card)' : 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'banners' ? '2px solid var(--color-cyan-primary)' : '2px solid transparent',
                        color: activeTab === 'banners' ? 'var(--color-cyan-primary)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '14px'
                    }}
                >
                    <ImageIcon size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Banners
                </button>
                <button
                    onClick={() => setActiveTab('featured')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'featured' ? 'var(--color-bg-card)' : 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'featured' ? '2px solid var(--color-cyan-primary)' : '2px solid transparent',
                        color: activeTab === 'featured' ? 'var(--color-cyan-primary)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '14px'
                    }}
                >
                    <Star size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Featured Products
                </button>
            </div>

            {loading ? (
                <div className="empty-state">Loading content...</div>
            ) : activeTab === 'banners' ? (
                sortedBanners.length === 0 ? (
                    <div className="empty-state">
                        <ImageIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No banners found.</p>
                        <button onClick={handleBannerAdd} className="btn-primary" style={{ marginTop: '16px' }}>
                            Add Your First Banner
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {sortedBanners.map((banner, index) => (
                            <div key={banner._id} style={{
                                background: 'var(--color-bg-card)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                overflow: 'hidden'
                            }}>
                                {banner.image && (
                                    <div style={{ height: '150px', background: 'var(--color-bg-secondary)', position: 'relative' }}>
                                        <img 
                                            src={getImageUrl(banner.image)} 
                                            alt={banner.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                            <span className={`status-badge ${banner.isActive ? 'status-active' : 'status-inactive'}`}>
                                                {banner.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div style={{ padding: '16px' }}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '16px', marginBottom: '4px' }}>
                                            {banner.title}
                                        </h3>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                            Position: {banner.position} • Order: {banner.order}
                                        </div>
                                        {banner.link && (
                                            <div style={{ fontSize: '12px', color: 'var(--color-cyan-primary)', marginTop: '4px' }}>
                                                Link: {banner.link}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                        <button 
                                            onClick={() => handleBannerReorder(banner._id, 'up')} 
                                            className="icon-btn"
                                            disabled={index === 0}
                                            title="Move Up"
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleBannerReorder(banner._id, 'down')} 
                                            className="icon-btn"
                                            disabled={index === sortedBanners.length - 1}
                                            title="Move Down"
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                        <button onClick={() => handleBannerEdit(banner)} className="icon-btn" title="Edit">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleBannerDelete(banner._id)} className="icon-btn danger" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                sortedFeatured.length === 0 ? (
                    <div className="empty-state">
                        <Star size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No featured products found.</p>
                        <button onClick={handleFeaturedAdd} className="btn-primary" style={{ marginTop: '16px' }}>
                            Add Your First Featured Product
                        </button>
                    </div>
                ) : (
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>Order</th>
                                    <th>Product</th>
                                    <th>Section</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedFeatured.map((featured, index) => (
                                    <tr key={featured._id}>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <button 
                                                    onClick={() => handleFeaturedReorder(featured._id, 'up')} 
                                                    className="icon-btn"
                                                    disabled={index === 0}
                                                    style={{ padding: '4px' }}
                                                    title="Move Up"
                                                >
                                                    <ArrowUp size={14} />
                                                </button>
                                                <span style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                    {featured.order}
                                                </span>
                                                <button 
                                                    onClick={() => handleFeaturedReorder(featured._id, 'down')} 
                                                    className="icon-btn"
                                                    disabled={index === sortedFeatured.length - 1}
                                                    style={{ padding: '4px' }}
                                                    title="Move Down"
                                                >
                                                    <ArrowDown size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {featured.product?.images?.[0] && (
                                                    <img
                                                        src={featured.product.images[0]}
                                                        alt=""
                                                        style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                                                    />
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{featured.product?.name || '-'}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                        ${featured.product?.price || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ textTransform: 'capitalize' }}>{featured.section}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${featured.isActive ? 'status-active' : 'status-inactive'}`}>
                                                {featured.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button onClick={() => handleFeaturedEdit(featured)} className="icon-btn" title="Edit">
                                                    <Pencil size={18} />
                                                </button>
                                                <button onClick={() => handleFeaturedDelete(featured._id)} className="icon-btn danger" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Banner Modal */}
            {isBannerModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                            </h2>
                            <button onClick={() => setIsBannerModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleBannerSubmit}>
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    className="form-input"
                                    value={bannerFormData.title}
                                    onChange={e => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                                    required
                                    placeholder="Banner title"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Link (Optional)</label>
                                <input
                                    className="form-input"
                                    value={bannerFormData.link}
                                    onChange={e => setBannerFormData({ ...bannerFormData, link: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Position</label>
                                    <select
                                        className="form-select"
                                        value={bannerFormData.position}
                                        onChange={e => setBannerFormData({ ...bannerFormData, position: e.target.value })}
                                    >
                                        <option value="homepage">Homepage</option>
                                        <option value="category">Category</option>
                                        <option value="product">Product</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Order</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={bannerFormData.order}
                                        onChange={e => setBannerFormData({ ...bannerFormData, order: parseInt(e.target.value) || 0 })}
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={bannerFormData.isActive}
                                        onChange={e => setBannerFormData({ ...bannerFormData, isActive: e.target.checked })}
                                    />
                                    <span>Active</span>
                                </label>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Banner Image {!editingBanner && '*'}</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setBannerFormData({ ...bannerFormData, image: e.target.files[0] })}
                                    className="form-input"
                                    style={{ padding: '8px' }}
                                    required={!editingBanner}
                                />
                                {editingBanner?.image && !bannerFormData.image && (
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        Current image will be kept if no new image is selected
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsBannerModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    <Save size={18} />
                                    {editingBanner ? 'Save Changes' : 'Create Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Featured Product Modal */}
            {isFeaturedModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingFeatured ? 'Edit Featured Product' : 'Add Featured Product'}
                            </h2>
                            <button onClick={() => setIsFeaturedModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleFeaturedSubmit}>
                            <div className="form-group">
                                <label className="form-label">Product *</label>
                                <select
                                    className="form-select"
                                    value={featuredFormData.productId}
                                    onChange={e => setFeaturedFormData({ ...featuredFormData, productId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Product</option>
                                    {products.map(product => (
                                        <option key={product._id} value={product._id}>
                                            {product.name} - ${product.price}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Section</label>
                                    <select
                                        className="form-select"
                                        value={featuredFormData.section}
                                        onChange={e => setFeaturedFormData({ ...featuredFormData, section: e.target.value })}
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="trending">Trending</option>
                                        <option value="new">New</option>
                                        <option value="sale">Sale</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Order</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={featuredFormData.order}
                                        onChange={e => setFeaturedFormData({ ...featuredFormData, order: parseInt(e.target.value) || 0 })}
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={featuredFormData.isActive}
                                        onChange={e => setFeaturedFormData({ ...featuredFormData, isActive: e.target.checked })}
                                    />
                                    <span>Active</span>
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsFeaturedModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    <Save size={18} />
                                    {editingFeatured ? 'Save Changes' : 'Add Featured Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Content;
