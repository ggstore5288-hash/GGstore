import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { getImageUrl } from '../utils/imageUtils';
import SmartImage from '../components/SmartImage';

const Categories = () => {
    const { categories, fetchCategories } = useProducts();

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="categories-page container">
            <style>{`
                .categories-page {
                    padding: 40px 20px;
                }
                .page-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 32px;
                    color: var(--color-cyan-primary);
                    margin-bottom: 32px;
                    text-align: center;
                }
                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }
                .category-card {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    text-decoration: none;
                    transition: transform 0.3s, border-color 0.3s;
                    position: relative;
                    height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .category-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--color-cyan-primary);
                }
                .category-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0.3;
                    transition: opacity 0.3s;
                }
                .category-card:hover .category-bg {
                    opacity: 0.5;
                }
                .category-name {
                    position: relative;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 24px;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                    z-index: 1;
                }
            `}</style>

            <h1 className="page-title">Explore Categories</h1>

            <div className="categories-grid">
                {categories.map(cat => (
                    <Link to={`/games?category=${cat._id}`} key={cat._id} className="category-card">
                        {cat.image && (
                            <SmartImage 
                                src={getImageUrl(cat.image)} 
                                alt={cat.name} 
                                className="category-bg" 
                                loading="eager" 
                            />
                        )}
                        <span className="category-name">{cat.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Categories;
