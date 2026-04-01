import React, { useState, useEffect } from 'react';
import { X, Upload, Loader, Image as ImageIcon, Wand2, Plus, Trash2 } from 'lucide-react';
import adminAPI from '../../api/admin';
import ImageUpload from '../ImageUpload';
import { REGIONS, PLATFORMS, PRODUCT_TYPES } from '../../utils/constants';
import { convertToDirectLink } from '../../utils/driveUtils';
import { getImageUrl } from '../../utils/imageUtils';

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
        images: [], // Can contain File objects or URL strings
        bannerImages: []
    });
    const [urlInput, setUrlInput] = useState('');
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
                    images: product.images || [],
                    bannerImages: product.bannerImages || []
                });
            } else {
                resetForm();
            }
        }
    }, [isOpen, product]);

    const fetchCategories = async () => {
        try {
            const data = await adminAPI.getCategories();
            let categoriesArray = [];
            if (Array.isArray(data)) {
                categoriesArray = data;
            } else if (data?.categories && Array.isArray(data.categories)) {
                categoriesArray = data.categories;
            } else if (data?.data && Array.isArray(data.data)) {
                categoriesArray = data.data;
            }
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
            images: [],
            bannerImages: []
        });
        setUrlInput('');
        setErrors({});
    };

    const handleAddUrlImage = () => {
        if (!urlInput.trim()) return;
        const converted = convertToDirectLink(urlInput.trim());
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, converted]
        }));
        setUrlInput('');
    };

    const handleMagicConvert = () => {
        if (!urlInput.trim()) return;
        const converted = convertToDirectLink(urlInput.trim());
        setUrlInput(converted);
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
        if (!formData.category) newErrors.category = 'Category is required';
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

            // Separate existing URLs and new Files
            const existingUrls = formData.images.filter(img => typeof img === 'string');
            const newFiles = formData.images.filter(img => typeof img !== 'string');

            // Send existing URLs as regular body fields
            if (existingUrls.length > 0) {
                existingUrls.forEach(url => {
                    formDataObj.append('existingImages', url);
                });
            }

            // Send new files
            if (newFiles.length > 0) {
                newFiles.forEach(file => {
                    formDataObj.append('images', file);
                });
            }

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
                        {/* Image Management Section */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--color-cyan-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Product Gallery
                            </label>
                            
                            {/* URL Add Section */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Add Direct Image URL (Drive, Dropbox, etc.)</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        className="form-input"
                                        value={urlInput}
                                        onChange={e => setUrlInput(e.target.value)}
                                        placeholder="Paste image link here..."
                                        style={{ marginBottom: 0, flex: 1 }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleMagicConvert}
                                        style={{ padding: '0 10px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-cyan-primary)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                                        title="Magic Convert"
                                    >
                                        <Wand2 size={16} />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleAddUrlImage}
                                        style={{ padding: '0 15px', background: 'var(--color-cyan-primary)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700' }}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Previews (Mixed URLs and Files) */}
                            {formData.images.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                            <img 
                                                src={typeof img === 'string' ? getImageUrl(img) : URL.createObjectURL(img)} 
                                                alt="" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => removeImage(idx)} 
                                                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.8)', border: 'none', borderRadius: '4px', color: '#fff', padding: '2px' }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Local Upload */}
                            <ImageUpload
                                onChange={(files) => {
                                    // Append new files to existing images
                                    const newFiles = Array.isArray(files) ? files : [files];
                                    setFormData(prev => ({
                                        ...prev,
                                        images: [...prev.images, ...newFiles]
                                    }));
                                }}
                                maxImages={8}
                                multiple={true}
                                preview={false} // We handle custom preview above
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>Product Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-bg-secondary)', border: `1px solid ${errors.name ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: '14px' }}
                                placeholder="Enter product name"
                            />
                            {errors.name && <span style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={3}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: '14px', resize: 'vertical' }}
                                placeholder="Enter product description"
                            />
                        </div>

                        {/* Price and Discount */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>Price ($) *</label>
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
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>Discount Price ($)</label>
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
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>Stock *</label>
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
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>Category *</label>
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

                        {/* Platform and Type */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>Platform *</label>
                                <select
                                    value={formData.platform}
                                    onChange={(e) => handleChange('platform', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-bg-secondary)', border: `1px solid ${errors.platform ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: '14px' }}
                                >
                                    {Object.values(PLATFORMS).map(platform => (
                                        <option key={platform} value={platform}>{platform}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>Type</label>
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

                        {/* Status */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange('isActive', e.target.checked)}
                                />
                                Active Product
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div style={{ padding: 'var(--spacing-lg)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onClose} disabled={loading} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 20px', background: loading ? 'var(--color-text-muted)' : 'var(--color-cyan-primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#000', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {loading && <Loader size={16} className="spin" />}
                        {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
