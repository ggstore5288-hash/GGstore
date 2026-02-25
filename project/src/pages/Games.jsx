import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GameGrid from '../components/GameGrid';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import { useProducts } from '../context/ProductContext';
import { Filter, ChevronDown } from 'lucide-react';

const Games = () => {
    const { products, loading, fetchProducts, categories, pagination } = useProducts();
    const location = useLocation();
    const [activeCategory, setActiveCategory] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 200 });
    const [page, setPage] = useState(1);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        const category = params.get('category');

        if (category) setActiveCategory(category);

        // If there's a search term in URL, update local query if needed (handled by SearchBar navigation)

        fetchProducts({
            search,
            category: category || activeCategory,
            sort: sortBy,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
            page: page,
            limit: 12
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.search, activeCategory, sortBy, priceRange, page]);

    const handleCategoryChange = (value) => {
        setActiveCategory(value);
        setPage(1);
    };

    const handlePriceChange = (e, type) => {
        const value = parseInt(e.target.value) || 0;
        setPriceRange(prev => ({
            ...prev,
            [type]: value
        }));
        setPage(1);
    };

    return (
        <div className="games-page">
            <style>{`
                .games-page {
                    min-height: 100vh;
                    background: radial-gradient(circle at 50% 0%, #1a1a2e 0%, #05050a 100%);
                    padding-top: 40px;
                }

                .content-container {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 0 40px 60px;
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 40px;
                }

                .sidebar {
                    background: rgba(20, 20, 30, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 24px;
                    height: fit-content;
                    position: sticky;
                    top: 100px;
                    backdrop-filter: blur(10px);
                }

                .sidebar-section {
                    margin-bottom: 32px;
                }

                .sidebar-section:last-child {
                    margin-bottom: 0;
                }

                .sidebar-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 18px;
                    color: white;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .sidebar-title::before {
                    content: '';
                    width: 3px;
                    height: 18px;
                    background: var(--color-cyan-primary);
                    border-radius: 2px;
                    box-shadow: 0 0 8px var(--color-cyan-primary);
                }

                .category-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .category-btn {
                    background: transparent;
                    border: none;
                    text-align: left;
                    color: var(--color-text-secondary);
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .category-btn:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.05);
                }

                .category-btn.active {
                    color: var(--color-bg-primary);
                    background: var(--color-cyan-primary);
                    font-weight: 600;
                    box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
                }

                .filter-select {
                    width: 100%;
                    background: rgba(10, 10, 20, 0.8);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 12px;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    outline: none;
                }

                .price-inputs {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .price-item {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .price-label {
                    font-size: 12px;
                    color: var(--color-text-secondary);
                }

                .price-input {
                    width: 100%;
                    background: rgba(10, 10, 20, 0.8);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 8px;
                    border-radius: 6px;
                    font-family: 'Inter', sans-serif;
                    outline: none;
                }

                .main-content {
                    width: 100%;
                }

                .results-header {
                    margin-bottom: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .results-count {
                    color: var(--color-text-secondary);
                    font-size: 14px;
                }
                
                .pagination-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 40px;
                    gap: 20px;
                    color: white;
                }

                .pagination-btn {
                    background: rgba(20, 20, 30, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 14px;
                }

                .pagination-btn:hover:not(:disabled) {
                    border-color: var(--color-cyan-primary);
                    color: var(--color-cyan-primary);
                }

                .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .page-info {
                    font-family: 'Orbitron', sans-serif;
                    color: var(--color-cyan-primary);
                }

                @media (max-width: 1024px) {
                    .content-container {
                        grid-template-columns: 1fr;
                    }
                    .sidebar {
                        position: relative;
                        top: 0;
                        margin-bottom: 30px;
                    }
                }
            `}</style>

            <div className="content-container">
                {/* Sidebar Section */}
                <aside className="sidebar">
                    {/* Search Section */}
                    <div className="sidebar-section">
                        <div className="sidebar-title">SEARCH</div>
                        <SearchBar />
                    </div>

                    {/* Categories Section */}
                    <div className="sidebar-section">
                        <div className="sidebar-title">CATEGORIES</div>
                        <div className="category-list">
                            <button
                                className={`category-btn ${activeCategory === '' ? 'active' : ''}`}
                                onClick={() => { setActiveCategory(''); setPage(1); }}
                            >
                                All Games
                                <ChevronDown size={16} style={{ transform: activeCategory === '' ? 'rotate(-90deg)' : 'rotate(0)', opacity: 0.5 }} />
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat._id}
                                    className={`category-btn ${activeCategory === cat._id ? 'active' : ''}`}
                                    onClick={() => { setActiveCategory(cat._id); setPage(1); }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range Section */}
                    <div className="sidebar-section">
                        <div className="sidebar-title">PRICE RANGE</div>
                        <div className="price-inputs">
                            <div className="price-item">
                                <label className="price-label">Min</label>
                                <input
                                    type="number"
                                    className="price-input"
                                    value={priceRange.min}
                                    onChange={(e) => handlePriceChange(e, 'min')}
                                    min="0"
                                />
                            </div>
                            <div className="price-item">
                                <label className="price-label">Max</label>
                                <input
                                    type="number"
                                    className="price-input"
                                    value={priceRange.max}
                                    onChange={(e) => handlePriceChange(e, 'max')}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sort Section */}
                    <div className="sidebar-section">
                        <div className="sidebar-title">SORT BY</div>
                        <select
                            className="filter-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A-Z</option>
                        </select>
                    </div>
                </aside>

                {/* Main Grid Section */}
                <main className="main-content">
                    <div className="results-header">
                        <h2 className="text-2xl font-bold text-white font-orbitron">ALL GAMES</h2>
                        {pagination?.totalDocs !== undefined && (
                            <span className="results-count">Showing {products.length} of {pagination.totalDocs} results</span>
                        )}
                    </div>

                    <GameGrid products={products} loading={loading} />

                    {/* Pagination Controls */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="pagination-container">
                            <button
                                className="pagination-btn"
                                disabled={!pagination.hasPrevPage}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Previous
                            </button>

                            <span className="page-info">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>

                            <button
                                className="pagination-btn"
                                disabled={!pagination.hasNextPage}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Games;

