import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import { Package, Plus, Search, Edit2, Trash2, Filter, TrendingUp, TrendingDown, DollarSign, Archive } from 'lucide-react';
import Pagination from '../../components/Pagination.jsx';
import { getImageUrl } from '../../utils/imageUtils';
import ProductFormModal from '../../components/admin/ProductFormModal';
import BulkActionsToolbar from '../../components/admin/BulkActionsToolbar';
import EmptyState from '../../components/EmptyState';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Categories
    const [categories, setCategories] = useState([]);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Bulk Selection
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        totalValue: 0
    });

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchTerm, selectedCategory, selectedStatus, sortBy]);

    useEffect(() => {
        calculateStats();
    }, [products]);

    const fetchCategories = async () => {
        try {
            const data = await adminAPI.getCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getProducts(currentPage, ITEMS_PER_PAGE, searchTerm);

            let fetchedProducts = [];
            if (response.products) {
                fetchedProducts = response.products;
                setTotalPages(response.pages);
                setTotalProducts(response.total);
            } else if (response.data && response.data.products) {
                fetchedProducts = response.data.products;
                setTotalPages(response.data.pages);
                setTotalProducts(response.data.total);
            }

            // Apply client-side filters
            let filtered = fetchedProducts;

            // Filter by category
            if (selectedCategory) {
                filtered = filtered.filter(p => {
                    const catId = p.category?._id || p.category;
                    return catId === selectedCategory;
                });
            }

            // Filter by status
            if (selectedStatus !== 'all') {
                filtered = filtered.filter(p =>
                    selectedStatus === 'active' ? p.isActive : !p.isActive
                );
            }

            // Filter by price range
            if (priceMin !== '') {
                filtered = filtered.filter(p => p.price >= parseFloat(priceMin));
            }
            if (priceMax !== '') {
                filtered = filtered.filter(p => p.price <= parseFloat(priceMax));
            }

            // Sort products
            filtered = sortProducts(filtered, sortBy);

            setProducts(filtered);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortProducts = (productsList, sortOrder) => {
        const sorted = [...productsList];
        switch (sortOrder) {
            case 'newest':
                return sorted.reverse();
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            default:
                return sorted;
        }
    };

    const calculateStats = () => {
        const active = products.filter(p => p.isActive).length;
        const inactive = products.filter(p => !p.isActive).length;
        const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

        setStats({
            total: totalProducts || products.length,
            active,
            inactive,
            totalValue
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await adminAPI.deleteProduct(id);
                setProducts(products.filter(p => p._id !== id));
                setSelectedProducts(selectedProducts.filter(pid => pid !== id));
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
            try {
                await Promise.all(selectedProducts.map(id => adminAPI.deleteProduct(id)));
                setProducts(products.filter(p => !selectedProducts.includes(p._id)));
                setSelectedProducts([]);
            } catch (error) {
                console.error('Error deleting products:', error);
                alert('Failed to delete some products');
            }
        }
    };

    const handleBulkStatusChange = async (isActive) => {
        try {
            await Promise.all(
                selectedProducts.map(id =>
                    adminAPI.updateProduct(id, { isActive })
                )
            );
            setProducts(products.map(p =>
                selectedProducts.includes(p._id) ? { ...p, isActive } : p
            ));
            setSelectedProducts([]);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleBulkCategoryChange = async (categoryId) => {
        try {
            await Promise.all(
                selectedProducts.map(id =>
                    adminAPI.updateProduct(id, { category: categoryId })
                )
            );
            fetchProducts(); // Refresh to get updated category data
            setSelectedProducts([]);
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Failed to update category');
        }
    };

    const toggleSelectProduct = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id)
                ? prev.filter(pid => pid !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p._id));
        }
    };

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const formatCompactNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div>
            {/* Hero Section with Stats */}
            <div style={{ marginBottom: '32px' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{
                        fontSize: 'clamp(28px, 4vw, 36px)',
                        fontWeight: '700',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'Orbitron, sans-serif',
                        marginBottom: 'var(--spacing-xs)'
                    }}>
                        Products
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--spacing-lg)'
                    }}>
                        Manage, monitor and update your store products easily.
                    </p>
                    <button
                        onClick={handleOpenAddModal}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'linear-gradient(135deg, #00d9ff 0%, #00a8cc 100%)',
                            color: '#0a0f14',
                            padding: '14px 28px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 20px rgba(0, 217, 255, 0.4)',
                            fontSize: '15px',
                            letterSpacing: '0.3px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 217, 255, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 217, 255, 0.4)';
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px) scale(0.98)';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                        }}
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        Add Product
                    </button>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    <div className="stats-card">
                        <div className="stats-icon" style={{ background: 'rgba(0, 217, 255, 0.1)' }}>
                            <Package size={24} color="var(--color-primary)" />
                        </div>
                        <div className="stats-content">
                            <div className="stats-label">Total Products</div>
                            <div className="stats-value">{stats.total}</div>
                        </div>
                    </div>

                    <div className="stats-card">
                        <div className="stats-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <TrendingUp size={24} color="var(--color-success)" />
                        </div>
                        <div className="stats-content">
                            <div className="stats-label">Active Products</div>
                            <div className="stats-value">{stats.active}</div>
                        </div>
                    </div>

                    <div className="stats-card">
                        <div className="stats-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                            <TrendingDown size={24} color="var(--color-danger)" />
                        </div>
                        <div className="stats-content">
                            <div className="stats-label">Inactive Products</div>
                            <div className="stats-value">{stats.inactive}</div>
                        </div>
                    </div>


                </div>
            </div>

            {/* Advanced Filters */}
            <div className="admin-card" style={{ marginBottom: '32px', padding: '24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    alignItems: 'end'
                }} className="filters-grid">
                    {/* Search */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '6px'
                        }}>
                            Search Products
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)'
                            }} />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 42px',
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '6px'
                        }}>
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '6px'
                        }}>
                            Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Price Min */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '6px'
                        }}>
                            Min Price
                        </label>
                        <input
                            type="number"
                            placeholder="$0"
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Price Max */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '6px'
                        }}>
                            Max Price
                        </label>
                        <input
                            type="number"
                            placeholder="$999"
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Sort */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '6px'
                        }}>
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Default</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="price-asc">Price (Low to High)</option>
                            <option value="price-desc">Price (High to Low)</option>
                            <option value="stock-asc">Stock (Low to High)</option>
                            <option value="stock-desc">Stock (High to Low)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="card-title" style={{
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <Package size={20} color="var(--color-primary)" style={{ marginRight: '12px' }} />
                <span style={{
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                }}>
                    Product List
                </span>
                <span style={{
                    fontSize: '12px',
                    background: 'var(--color-bg-secondary)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    color: 'var(--color-text-secondary)',
                    marginLeft: '8px',
                    fontWeight: '500'
                }}>
                    {products.length} items
                </span>
            </div>

            <div className="minimal-table-wrapper" style={{ overflowX: 'auto', width: '100%', marginBottom: '32px' }}>
                <div className="minimal-table-container" style={{ minWidth: '1100px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                        </div>
                    ) : products.length === 0 ? (
                        <EmptyState
                            icon={Archive}
                            title="No products found"
                            message="No products match your current filters. Try adjusting your search criteria or add your first product."
                            actionLabel="Add Product"
                            onAction={handleOpenAddModal}
                        />
                    ) : (
                        <div className="product-grid-minimal">
                            {/* Minimalism Header */}
                            <div className="product-grid-header-minimal">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.length === products.length && products.length > 0}
                                        onChange={toggleSelectAll}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </div>
                                <div>IMAGE</div>
                                <div>PRODUCT DETAILS</div>
                                <div>CATEGORY</div>
                                <div>ATTRIBUTES</div>
                                <div>PERFORMANCE</div>
                                <div>PRICE & STOCK</div>
                                <div>STATUS</div>
                                <div style={{ textAlign: 'right' }}>ACTIONS</div>
                            </div>

                            {/* Grid Body */}
                            <div className="product-grid-body-minimal">
                                {products.map((product, index) => (
                                    <div
                                        key={product._id}
                                        className="product-grid-row-minimal"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Checkbox */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product._id)}
                                                onChange={() => toggleSelectProduct(product._id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </div>

                                        {/* Image */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img
                                                src={getImageUrl(product.images?.[0] || product.image)}
                                                alt={product.name}
                                                className="product-grid-minimal-img"
                                                onError={(e) => { e.target.src = 'https://placehold.co/60x60/1a212c/64748b?text=No+Image'; }}
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="product-details-col">
                                            <div className="product-title">{product.name}</div>
                                            <div className="product-subtitle">{product.description || 'No description'}</div>
                                            <div className="product-badges">
                                                {product.isFeatured && <span className="badge-featured">Featured</span>}
                                                {product.isFlashSale && <span className="badge-flash">Flash Sale</span>}
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div className="product-category-col">
                                            <span className="category-tag-minimal">
                                                {product.category?.name || product.category || 'Uncategorized'}
                                            </span>
                                        </div>

                                        {/* Attributes */}
                                        <div className="product-attributes-col">
                                            <div className="attribute-item">
                                                <span className="attr-key">Type:</span>
                                                <span className="attr-val">{product.type || 'N/A'}</span>
                                            </div>
                                            <div className="attribute-item">
                                                <span className="attr-key">Platform:</span>
                                                <span className="attr-val">{product.platform || 'N/A'}</span>
                                            </div>
                                            <div className="attribute-item">
                                                <span className="attr-key">Region:</span>
                                                <span className="attr-val">{product.region || 'N/A'}</span>
                                            </div>
                                        </div>

                                        {/* Performance */}
                                        <div className="product-performance-col">
                                            <div className="performance-rating">
                                                <span className="star-icon">★</span>
                                                <span className="rating-val">{product.averageRating?.toFixed(1) || '0.0'}</span>
                                                <span className="rating-count">({product.totalReviews || 0})</span>
                                            </div>
                                            <div className="performance-stats">
                                                <div className="stat-item">
                                                    <span className="stat-icon">👁</span>
                                                    <span>{formatCompactNumber(product.viewCount || 0)}</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="stat-icon">🛒</span>
                                                    <span>{formatCompactNumber(product.purchaseCount || 0)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price & Stock */}
                                        <div className="product-price-stock-col">
                                            <div className="product-price-minimal">{formatPrice(product.price)}</div>
                                            <div className="product-stock-minimal">
                                                <span className="stock-bullet-minimal"></span>
                                                <span className="stock-label-minimal">Stock: {product.stock || 0}</span>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="product-status-col">
                                            <span className={`status-pill-minimal ${product.isActive ? 'active' : 'inactive'}`}>
                                                <span className="status-dot-minimal"></span>
                                                {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="product-actions-col">
                                            <button onClick={() => handleOpenEditModal(product)} className="action-btn-minimal" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(product._id)} className="action-btn-minimal danger" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    .product-grid-minimal {
                        display: flex;
                        flex-direction: column;
                        font-family: 'Inter', sans-serif;
                    }

                    .product-grid-header-minimal {
                        display: grid;
                        grid-template-columns: 40px 80px 3fr 1.5fr 2fr 1.5fr 1.5fr 1fr 120px;
                        padding: 12px 0;
                        color: #94a3b8;
                        font-size: 13px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        border-bottom: 2px solid #1e293b;
                        position: sticky;
                        top: 0;
                        z-index: 10;
                    }

                    @media (max-width: 1024px) {
                        .filters-grid {
                            grid-template-columns: 1fr 1fr !important;
                        }
                    }

                    @media (max-width: 768px) {
                        .filters-grid {
                            grid-template-columns: 1fr !important;
                        }
                    }

                    .product-grid-row-minimal {
                        display: grid;
                        grid-template-columns: 40px 80px 3fr 1.5fr 2fr 1.5fr 1.5fr 1fr 120px;
                        padding: 16px 0;
                        align-items: center;
                        border-bottom: 1px solid #1e293b;
                        transition: all 0.2s ease;
                        animation: fadeIn 0.3s ease forwards;
                    }

                    .product-grid-row-minimal:hover {
                        background: rgba(30, 41, 59, 0.2);
                    }

                    .product-grid-minimal-img {
                        width: 60px;
                        height: 60px;
                        object-fit: cover;
                        border-radius: 8px;
                        border: 1px solid #334155;
                    }

                    .product-details-col {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        padding-left: 20px;
                    }

                    .product-title {
                        font-weight: 700;
                        font-size: 16px;
                        color: #ffffff;
                    }

                    .product-subtitle {
                        font-size: 13px;
                        color: #94a3b8;
                    }

                    .category-tag-minimal {
                        background: #1e293b;
                        padding: 6px 10px;
                        border-radius: 6px;
                        font-size: 12px;
                        color: #ffffff;
                        font-weight: 500;
                        border: 1px solid #334155;
                    }

                    .product-price-minimal {
                        font-weight: 800;
                        color: #00d9ff;
                        font-size: 18px;
                        font-family: 'Orbitron', sans-serif;
                    }

                    .stock-bullet-minimal {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #f97316;
                    }

                    .stock-label-minimal {
                        color: #94a3b8;
                        font-size: 13px;
                    }

                    .status-pill-minimal {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 4px 10px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 700;
                    }

                    .status-pill-minimal.active {
                        background: rgba(16, 185, 129, 0.1);
                        color: #10b981;
                    }

                    .status-pill-minimal.inactive {
                        background: rgba(239, 68, 68, 0.1);
                        color: #ef4444;
                    }

                    .status-dot-minimal {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: currentColor;
                    }

                    .product-actions-col {
                        display: flex;
                        gap: 10px;
                        justify-content: center;
                        align-items: center;
                    }

                    .action-btn-minimal {
                        width: 36px;
                        height: 36px;
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

                    .action-btn-minimal:hover {
                        color: #ffffff;
                        background: #1e293b;
                        transform: translateY(-2px);
                    }

                    .action-btn-minimal.danger:hover {
                        background: rgba(239, 68, 68, 0.1);
                        color: #ef4444;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                ` }} />

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div style={{ padding: '32px 0 20px', display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Product Form Modal */}
            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                }}
                product={editingProduct}
                onSuccess={fetchProducts}
            />

            {/* Bulk Actions Toolbar */}
            <BulkActionsToolbar
                selectedCount={selectedProducts.length}
                onClearSelection={() => setSelectedProducts([])}
                onBulkDelete={handleBulkDelete}
                onBulkStatusChange={handleBulkStatusChange}
                onBulkCategoryChange={handleBulkCategoryChange}
                categories={categories}
            />
        </div>
    );
};

export default Products;
