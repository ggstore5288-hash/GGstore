import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GameGrid from '../components/GameGrid';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import ReviewSlider from '../components/ReviewSlider';
import { useProducts } from '../context/ProductContext';
import { Filter, ChevronDown, Zap, Clock } from 'lucide-react';

const Home = () => {
    const { products, loading, fetchProducts, categories } = useProducts();
    const location = useLocation();
    const [activeCategory, setActiveCategory] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        const categoryFromUrl = params.get('category');

        // Sync URL param to state without triggering another re-render
        const effectiveCategory = categoryFromUrl || activeCategory;
        if (categoryFromUrl && categoryFromUrl !== activeCategory) {
            setActiveCategory(categoryFromUrl);
            return; // The state update above will re-trigger this effect with the correct value
        }

        fetchProducts({
            search,
            category: effectiveCategory,
            sort: sortBy
        });
    }, [location.search, activeCategory, sortBy]);

    const handleCategoryChange = (e) => {
        setActiveCategory(e.target.value);
    };

    return (
        <div className="home-page">
            <style>{`
                .home-page {
                    min-height: 100vh;
                    background: radial-gradient(circle at 50% 0%, #1a1a2e 0%, #05050a 100%);
                }
                
                .search-section {
                    padding: clamp(20px, 5vw, 40px) 20px 20px;
                    position: relative;
                    z-index: 10;
                }

                .content-container {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 0 clamp(16px, 4vw, 40px) 60px;
                }

                .filters-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 40px 0 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    gap: 20px;
                }

                .section-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: clamp(18px, 3vw, 24px);
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    white-space: nowrap;
                }
                
                .section-title::before {
                    content: '';
                    width: 4px;
                    height: 24px;
                    background: var(--color-cyan-primary);
                    border-radius: 2px;
                    box-shadow: 0 0 10px var(--color-cyan-primary);
                }

                .filters-group {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                }

                .filter-select {
                    background: rgba(20, 20, 30, 0.8);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    outline: none;
                    transition: all 0.3s;
                    font-size: 14px;
                }
                
                .filter-select:hover {
                    border-color: var(--color-cyan-primary);
                    box-shadow: 0 0 15px rgba(0, 217, 255, 0.1);
                }

                @media (max-width: 768px) {
                     .filters-bar { 
                        flex-direction: column; 
                        align-items: flex-start; 
                        margin: 30px 0 20px;
                     }
                     .filters-group { 
                        width: 100%; 
                        justify-content: flex-start;
                        gap: 10px;
                     }
                     .filter-select {
                        flex: 1;
                        min-width: 140px;
                     }
                }

                @media (max-width: 480px) {
                    .filter-select {
                        width: 100%;
                        flex: none;
                    }
                }
            `}</style>

            <div className="search-section">
                <SearchBar />
            </div>

            <div className="content-container">
                <Hero />

                <div className="filters-bar">
                    <h2 className="section-title">LATEST GAMES</h2>

                    <div className="filters-group">
                        <select
                            className="filter-select"
                            value={activeCategory}
                            onChange={handleCategoryChange}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>

                        <select
                            className="filter-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A-Z</option>
                        </select>
                    </div>
                </div>

                <GameGrid products={products} loading={loading} />
            </div>

            <ReviewSlider />
        </div>
    );
};

export default Home;
