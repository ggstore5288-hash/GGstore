import React, { useState, useEffect } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import adminAPI from '../../api/admin';
import ImageUpload from '../ImageUpload';
import { REGIONS, PLATFORMS, PRODUCT_TYPES } from '../../utils/constants';

const ProductFormModal = ({ isOpen, onClose, product = null, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        stock: '',
        type: 'game',
        platform: 'PC',
        region: 'Global',
        isActive: true,
        images: []
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (product) {
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price || '',
                    discountPrice: product.discountPrice || '',
                    category: product.category?._id || product.category || '',
                    stock: product.stock || '',
                    type: product.type || 'game',
                    platform: product.platform || 'PC',
                    region: product.region || 'Global',
                    isActive: product.isActive ?? true,
                    images: product.images || []
                });
            } else {
                resetForm();
            }
        }
    }, [isOpen, product]);

    const fetchCategories = async () => {
        try {
            const data = await adminAPI.getCategories();
            console.log('Categories fetched:', data);

            // Handle different response structures
            let categoriesArray = [];
            if (Array.isArray(data)) {
                categoriesArray = data;
            } else if (data?.categories && Array.isArray(data.categories)) {
                categoriesArray = data.categories;
            } else if (data?.data && Array.isArray(data.data)) {
                categoriesArray = data.data;
            }

            console.log('Categories array:', categoriesArray);
            setCategories(categoriesArray);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            discountPrice: '',
            category: '',
            stock: '',
            type: 'game',
            platform: 'PC',
            region: 'Global',
            isActive: true,
            images: []
        });
        setErrors({});
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
        if (!formData.category) newErrors.category = 'Category is required';
        // SKU is only required for new products, optional for updates
        if (!formData.platform.trim()) newErrors.platform = 'Platform is required';
        if (!formData.region.trim()) newErrors.region = 'Region is required';
        if (formData.stock === '' || formData.stock < 0) newErrors.stock = 'Valid stock is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const formDataObj = new FormData();
            formDataObj.append('name', formData.name);
            formDataObj.append('description', formData.description || 'No description provided');
            formDataObj.append('price', formData.price);
            if (formData.discountPrice) {
                formDataObj.append('discountPrice', formData.discountPrice);
            }
            formDataObj.append('category', formData.category);
            formDataObj.append('stock', formData.stock);
            formDataObj.append('isActive', formData.isActive);
            formDataObj.append('type', formData.type);
            formDataObj.append('platform', formData.platform);
            formDataObj.append('region', formData.region);



            if (formData.images && formData.images.length > 0) {
                formData.images.forEach(image => {
                    formDataObj.append('images', image);
                });
            }

            console.log('Submitting product data (FormData)');

            if (product) {
                await adminAPI.updateProduct(product._id, formDataObj);
            } else {
                await adminAPI.createProduct(formDataObj);
            }

            onSuccess && onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error saving product:', error);
            console.error('Error response:', error.response?.data);
            setErrors({ submit: error.response?.data?.message || 'Failed to save product' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 'var(--spacing-lg)',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: 'var(--spacing-lg)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'Orbitron, sans-serif'
                    }}>
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: 'var(--radius-sm)',
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'var(--color-bg-secondary)';
                            e.target.style.color = 'var(--color-text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = 'var(--color-text-muted)';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{
                    padding: 'var(--spacing-lg)',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    {errors.submit && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--color-danger)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-danger)',
                            marginBottom: 'var(--spacing-lg)',
                            fontSize: '14px'
                        }}>
                            {errors.submit}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        {/* Image Upload - Moved to top */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: 'var(--color-text-primary)',
                                marginBottom: 'var(--spacing-sm)'
                            }}>
                                Product Images
                            </label>
                            <ImageUpload
                                images={formData.images}
                                onChange={(images) => handleChange('images', images)}
                                maxImages={5}
                                multiple={true}
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: 'var(--color-text-primary)',
                                marginBottom: 'var(--spacing-sm)'
                            }}>
                                Product Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'var(--color-bg-secondary)',
                                    border: `1px solid ${errors.name ? 'var(--color-danger)' : 'var(--color-border)'}`,
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '14px'
                                }}
                                placeholder="Enter product name"
                            />
                            {errors.name && (
                                <span style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                                    {errors.name}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: 'var(--color-text-primary)',
                                marginBottom: 'var(--spacing-sm)'
                            }}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '14px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                                placeholder="Enter product description"
                            />
                        </div>

                        {/* Price and Discount */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                                    Price ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => handleChange('price', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-bg-secondary)', border: `1px solid ${errors.price ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: '14px' }}
                                    placeholder="0.00"
                                />
                                {errors.price && <span style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>{errors.price}</span>}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                                    Discount Price ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.discountPrice}
                                    onChange={(e) => handleChange('discountPrice', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: '14px' }}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Stock and Category */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                                    Stock *
                                </label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => handleChange('stock', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-bg-secondary)', border: `1px solid ${errors.stock ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: '14px' }}
                                    placeholder="0"
                                />
                                {errors.stock && <span style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>{errors.stock}</span>}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleChange('category', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-bg-secondary)', border: `1px solid ${errors.category ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: '14px' }}
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category && <span style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>{errors.category}</span>}
                            </div>
                        </div>

                        {/* Type */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                                    Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: '14px' }}
                                >
                                    <option value="game">Game</option>
                                    <option value="giftcard">Gift Card</option>
                                    <option value="subscription">Subscription</option>
                                    <option value="software">Software</option>
                                </select>
                            </div>
                        </div>

                        {/* Platform and Region */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                                    Platform *
                                </label>
                                <select
                                    value={formData.platform}
                                    onChange={(e) => handleChange('platform', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-bg-secondary)', border: `1px solid ${errors.platform ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: '14px' }}
                                >
                                    {Object.values(PLATFORMS).map(platform => (
                                        <option key={platform} value={platform}>{platform}</option>
                                    ))}
                                </select>
                                {errors.platform && <span style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>{errors.platform}</span>}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                                    Region *
                                </label>
                                <select
                                    value={formData.region}
                                    onChange={(e) => handleChange('region', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-bg-secondary)', border: `1px solid ${errors.region ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: '14px' }}
                                >
                                    {Object.values(REGIONS).map(region => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                                {errors.region && <span style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>{errors.region}</span>}
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange('isActive', e.target.checked)}
                                    style={{ cursor: 'pointer' }}
                                />
                                Active Product
                            </label>
                        </div>


                    </div>
                </form>

                {/* Footer */}
                <div style={{
                    padding: 'var(--spacing-lg)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-secondary)',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            background: loading ? 'var(--color-text-muted)' : 'var(--color-primary)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            color: '#000',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {loading && <Loader size={16} className="spin" />}
                        {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
