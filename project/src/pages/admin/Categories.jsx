import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import { Folder, Plus, Edit2, Trash2, Search, Upload, X, Check, AlertCircle, Loader2, Image as ImageIcon, Eye, EyeOff, Wand2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUtils';
import { convertToDirectLink } from '../../utils/driveUtils';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null,
        imageUrl: ''
    });
    const [previewImage, setPreviewImage] = useState(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getCategories();
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            addToast('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file, imageUrl: '' });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleMagicConvert = () => {
        if (!formData.imageUrl) return;
        const converted = convertToDirectLink(formData.imageUrl);
        setFormData({ ...formData, imageUrl: converted, image: null });
        setPreviewImage(converted);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            addToast('Category name is required', 'error');
            return;
        }

        try {
            setActionLoading(true);
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            
            if (formData.image instanceof File) {
                data.append('image', formData.image);
            } else if (formData.imageUrl) {
                data.append('imageUrl', formData.imageUrl);
            }

            if (editingCategory) {
                await adminAPI.updateCategory(editingCategory._id, data);
                addToast('Category updated successfully', 'success');
            } else {
                await adminAPI.createCategory(data);
                addToast('Category created successfully', 'success');
            }

            setIsModalOpen(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Operation failed:', error);
            addToast(error.response?.data?.message || 'Failed to save category', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? This will affect products linked to it.')) {
            try {
                setActionLoading(true);
                await adminAPI.deleteCategory(id);
                addToast('Category deleted successfully', 'success');
                fetchCategories();
            } catch (error) {
                console.error('Failed to delete category:', error);
                addToast('Failed to delete category', 'error');
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            setActionLoading(true);
            if (adminAPI.toggleCategoryStatus) {
                await adminAPI.toggleCategoryStatus(id);
            } else {
                const cat = categories.find(c => c._id === id);
                const data = new FormData();
                data.append('isActive', !cat.isActive);
                await adminAPI.updateCategory(id, data);
            }
            addToast('Status updated', 'success');
            fetchCategories();
        } catch (error) {
            console.error('Failed to toggle status:', error);
            addToast('Failed to update status', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', image: null, imageUrl: '' });
        setPreviewImage(null);
        setEditingCategory(null);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            image: null,
            imageUrl: category.image || ''
        });
        setPreviewImage(category.image ? getImageUrl(category.image) : null);
        setIsModalOpen(true);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="categories-page animate-fade-in">
            <div className="admin-header-v2">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: '250px' }}>
                        <h1 className="page-title-v2">Category Management</h1>
                        <p className="page-subtitle-v2">Organize your products with professional categories</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="btn-primary-v2"
                    >
                        <Plus size={18} />
                        <span>Add Category</span>
                    </button>
                </div>

                <div className="search-container-v2">
                    <Search size={18} className="search-icon-v2" />
                    <input
                        type="text"
                        placeholder="Search categories by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-v2"
                    />
                </div>
            </div>

            <div className="content-container-v2">
                <div className="stats-row-v2">
                    <div className="stat-card-v2">
                        <Folder className="stat-icon-v2" size={20} />
                        <div className="stat-info-v2">
                            <span className="stat-label-v2">Total Categories</span>
                            <span className="stat-value-v2">{categories.length}</span>
                        </div>
                    </div>
                    <div className="stat-card-v2">
                        <Check className="stat-icon-v2 text-success" size={20} />
                        <div className="stat-info-v2">
                            <span className="stat-label-v2">Active</span>
                            <span className="stat-value-v2">{categories.filter(c => c.isActive !== false).length}</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state-v2">
                        <Loader2 className="animate-spin" size={40} />
                        <p>Fetching categories...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="empty-state-v2">
                        <div className="empty-icon-v2">
                            <Folder size={48} />
                        </div>
                        <h3>No categories found</h3>
                        <p>{searchTerm ? "Try a different search term" : "Start by creating your first category"}</p>
                        {!searchTerm && (
                            <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="btn-secondary-v2">
                                Create New Category
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="category-table-wrapper" style={{ overflowX: 'auto', width: '100%', marginBottom: '32px' }}>
                        <div className="category-table-container-v2" style={{ minWidth: '800px' }}>
                            <table className="admin-table-v2">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>Image</th>
                                        <th>Name & Description</th>
                                        <th style={{ width: '120px' }}>Status</th>
                                        <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map((category) => (
                                        <tr key={category._id} className="table-row-v2">
                                            <td>
                                                <div className="category-avatar-v2">
                                                    <img
                                                        src={category.image ? getImageUrl(category.image) : 'https://placehold.co/80x80/1a212c/64748b?text=NA'}
                                                        alt={category.name}
                                                        onError={(e) => { e.target.src = 'https://placehold.co/80x80/1a212c/64748b?text=ERR'; }}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span className="name-v2">{category.name}</span>
                                                    <span className="desc-v2">
                                                        {category.description || 'No description provided.'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-pill-v2 ${category.isActive !== false ? 'active' : 'inactive'}`}>
                                                    <span className="dot"></span>
                                                    {category.isActive !== false ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions-wrapper-v2">
                                                    <button onClick={() => handleToggleStatus(category._id)} className="action-btn-v2" title={category.isActive !== false ? 'Deactivate' : 'Activate'}>
                                                        {category.isActive !== false ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button onClick={() => openEditModal(category)} className="action-btn-v2" title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(category._id)} className="action-btn-v2 danger" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay-v2">
                    <div className="modal-content-v2 scale-in">
                        <div className="modal-header-v2">
                            <div className="modal-title-box-v2">
                                <div className="modal-icon-v2">
                                    {editingCategory ? <Edit2 size={20} /> : <Plus size={20} />}
                                </div>
                                <div>
                                    <h3>{editingCategory ? 'Update Category' : 'Create New Category'}</h3>
                                    <p>Fill in the details below to save your category</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="modal-close-v2">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form-v2">
                            <div className="form-section-v2">
                                <div className="form-field-v2">
                                    <label>Category Name</label>
                                    <div className="input-with-icon-v2">
                                        <Folder size={18} className="field-icon-v2" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Sports, Action, RPG"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-field-v2">
                                    <label>Description (Optional)</label>
                                    <textarea
                                        placeholder="Describe what items belong in this category..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                    />
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="form-field-v2">
                                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            Direct Image URL
                                            <span style={{ fontSize: '10px', opacity: 0.5 }}>Pro Performance</span>
                                        </label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                className="form-input"
                                                value={formData.imageUrl}
                                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value, image: null })}
                                                placeholder="Google Drive, Dropbox, or any direct link..."
                                                style={{ marginBottom: 0, paddingLeft: '16px' }}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleMagicConvert}
                                                style={{ 
                                                    background: 'rgba(0, 217, 255, 0.1)', 
                                                    border: '1px solid rgba(0, 217, 255, 0.2)',
                                                    color: '#00d9ff',
                                                    width: '46px',
                                                    height: '46px',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}
                                                title="Magic Convert (Drive/Dropbox)"
                                            >
                                                <Wand2 size={20} />
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '10px', marginTop: '6px', color: '#64748b' }}>
                                            Tip: Paste a Google Drive link and click the wand to make it ultra-fast.
                                        </p>
                                    </div>
                                </div>

                                <div className="form-field-v2">
                                    <label>Or Upload Manually {!formData.imageUrl && '*'}</label>
                                    <div className="image-upload-v2">
                                        <input
                                            type="file"
                                            id="category-image"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden-input"
                                            required={!editingCategory && !formData.imageUrl}
                                        />
                                        <label htmlFor="category-image" className="upload-dropzone-v2">
                                            {previewImage ? (
                                                <div className="preview-container-v2">
                                                    <img src={previewImage} alt="Preview" onError={(e) => { e.target.src = 'https://placehold.co/400x200/1a212c/64748b?text=Preview+Error'; }} />
                                                    <div className="preview-overlay-v2">
                                                        <Upload size={24} />
                                                        <span>Replace Media</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="upload-placeholder-v2">
                                                    <div className="icon-circle-v2">
                                                        <ImageIcon size={32} />
                                                    </div>
                                                    <p className="primary-text">Select local file</p>
                                                    <p className="secondary-text">Full priority given to URL if both present</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer-v2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-ghost-v2"
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit-v2"
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            {editingCategory ? <Check size={18} /> : <Plus size={18} />}
                                            <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

                .categories-page {
                    font-family: 'Inter', sans-serif;
                    color: #e2e8f0;
                }

                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                .scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .stats-row-v2 { flex-direction: column; }
                    .admin-header-v2 { padding: 20px; }
                    .page-title-v2 { font-size: 24px; }
                }

                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                .admin-header-v2 {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 32px;
                    margin-bottom: 24px;
                    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
                }

                .page-title-v2 {
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 32px;
                    font-weight: 700;
                    background: linear-gradient(to right, #00d9ff, #0072ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0;
                    letter-spacing: 0.5px;
                }

                .page-subtitle-v2 {
                    color: #94a3b8;
                    font-size: 14px;
                    margin: 4px 0 0 0;
                }

                .btn-primary-v2 {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: linear-gradient(135deg, #00d9ff 0%, #0072ff 100%);
                    color: #000;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 15px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 15px rgba(0, 217, 255, 0.3);
                }

                .btn-primary-v2:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 217, 255, 0.5);
                }

                .btn-submit-v2 {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #00d9ff;
                    color: #000;
                    padding: 12px 28px;
                    border-radius: 10px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-submit-v2:hover:not(:disabled) {
                    background: #00c4e0;
                    box-shadow: 0 0 15px rgba(0, 217, 255, 0.4);
                }

                .btn-ghost-v2 {
                    background: rgba(255, 255, 255, 0.05);
                    color: #94a3b8;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-ghost-v2:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .search-container-v2 {
                    margin-top: 24px;
                    position: relative;
                    max-width: 500px;
                }

                .search-icon-v2 {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                }

                .search-input-v2 {
                    width: 100%;
                    background: rgba(2, 6, 23, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 14px 14px 14px 48px;
                    color: #fff;
                    font-size: 15px;
                    transition: all 0.3s;
                    outline: none;
                }

                .search-input-v2:focus {
                    border-color: #00d9ff;
                    box-shadow: 0 0 0 4px rgba(0, 217, 255, 0.1);
                    background: rgba(2, 6, 23, 0.8);
                }

                .stats-row-v2 { display: flex; gap: 16px; margin-bottom: 24px; }
                .stat-card-v2 {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: rgba(15, 23, 42, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 16px 24px;
                    border-radius: 16px;
                }

                .stat-icon-v2 { color: #00d9ff; }
                .text-success { color: #10b981; }
                .stat-label-v2 { color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                .stat-value-v2 { display: block; font-size: 20px; font-weight: 700; color: #fff; }

                .category-table-container-v2 {
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 50px -20px rgba(0, 0, 0, 0.5);
                }

                .admin-table-v2 { width: 100%; border-collapse: collapse; }
                .admin-table-v2 th {
                    text-align: left;
                    padding: 16px 24px;
                    background: rgba(2, 6, 23, 0.5);
                    color: #64748b;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .table-row-v2 {
                    transition: background 0.2s;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                }

                .table-row-v2:hover { background: rgba(255, 255, 255, 0.02); }
                .table-row-v2 td { padding: 20px 24px; }

                .category-avatar-v2 {
                    width: 64px;
                    height: 64px;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: #020617;
                }

                .category-avatar-v2 img { width: 100%; height: 100%; object-fit: cover; }
                .name-v2 { display: block; color: #fff; font-weight: 600; font-size: 16px; }
                .desc-v2 { color: #94a3b8; font-size: 13px; line-height: 1.4; max-width: 400px; }

                .status-pill-v2 {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 4px 12px;
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                .status-pill-v2.active { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.2); }
                .status-pill-v2.inactive { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.2); }
                .status-pill-v2 .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; box-shadow: 0 0 10px currentColor; }

                .actions-wrapper-v2 { display: flex; gap: 8px; justify-content: flex-end; }
                .action-btn-v2 {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(255, 255, 255, 0.03);
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn-v2:hover { background: rgba(255, 255, 255, 0.1); color: #fff; transform: translateY(-2px); }
                .action-btn-v2.danger:hover { background: #ef4444; color: #fff; border-color: #ef4444; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); }

                .modal-overlay-v2 {
                    position: fixed;
                    inset: 0;
                    background: rgba(2, 6, 23, 0.85);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal-content-v2 {
                    background: #0f172a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    width: 100%;
                    max-width: 560px;
                    box-shadow: 0 25px 70px -15px rgba(0, 0, 0, 0.6);
                    overflow: hidden;
                }

                .modal-header-v2 {
                    padding: 24px 32px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .modal-title-box-v2 { display: flex; gap: 16px; align-items: center; }
                .modal-icon-v2 {
                    width: 48px;
                    height: 48px;
                    background: rgba(0, 217, 255, 0.1);
                    color: #00d9ff;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-title-box-v2 h3 { margin: 0; font-size: 20px; color: #fff; }
                .modal-title-box-v2 p { margin: 4px 0 0 0; color: #64748b; font-size: 13px; }

                .modal-close-v2 { background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; transition: color 0.2s; }
                .modal-close-v2:hover { color: #fff; }

                .modal-form-v2 { padding: 32px; }
                .form-section-v2 { display: flex; flex-direction: column; gap: 24px; }
                .form-field-v2 label { display: block; font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }

                .input-with-icon-v2 { position: relative; }
                .field-icon-v2 { position: absolute; left: 16px; top: 15px; color: #64748b; }

                .form-field-v2 input, .form-field-v2 textarea {
                    width: 100%;
                    background: #020617;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 14px 16px;
                    color: #fff;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.2s;
                }

                .form-field-v2 input { padding-left: 48px; }
                .form-field-v2 input:focus, .form-field-v2 textarea:focus { border-color: #00d9ff; box-shadow: 0 0 0 4px rgba(0, 217, 255, 0.05); }

                .image-upload-v2 .hidden-input { display: none; }
                .upload-dropzone-v2 {
                    display: block;
                    border: 2px dashed rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 32px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #020617;
                    position: relative;
                    overflow: hidden;
                    min-height: 180px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .upload-dropzone-v2:hover { border-color: #00d9ff; background: rgba(0, 217, 255, 0.02); }

                .icon-circle-v2 {
                    width: 64px;
                    height: 64px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 50%;
                    margin: 0 auto 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                }

                .primary-text { color: #e2e8f0; font-weight: 600; font-size: 15px; margin: 0; }
                .secondary-text { color: #64748b; font-size: 12px; margin: 4px 0 0 0; }

                .preview-container-v2 { width: 100%; height: 180px; position: relative; }
                .preview-container-v2 img { width: 100%; height: 100%; object-fit: contain; }
                .preview-overlay-v2 {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    opacity: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 0.2s;
                    gap: 8px;
                    color: #fff;
                    font-weight: 600;
                    font-size: 14px;
                }

                .preview-container-v2:hover .preview-overlay-v2 { opacity: 1; }

                .modal-footer-v2 { padding: 0 32px 32px; display: flex; justify-content: flex-end; gap: 12px; }

                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .loading-state-v2, .empty-state-v2 {
                    padding: 100px 0;
                    text-align: center;
                    background: rgba(15, 23, 42, 0.4);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .loading-state-v2 p { color: #94a3b8; margin-top: 16px; }
                .empty-icon-v2 { width: 80px; height: 80px; background: rgba(255, 255, 255, 0.03); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #64748b; }
                .empty-state-v2 h3 { margin: 0; color: #fff; }
                .empty-state-v2 p { color: #64748b; margin: 8px 0 24px; }
                .btn-secondary-v2 { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; }
                ` }} />
        </div>
    );
};

export default Categories;
