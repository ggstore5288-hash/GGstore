import React, { createContext, useContext, useState, useEffect } from 'react';
import productsAPI from '../api/products';
import categoriesAPI from '../api/categories';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);

    // Fetch products with filters
    const fetchProducts = async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await productsAPI.getProducts(filters);
            setProducts(data.products);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async (activeOnly = true) => {
        try {
            const data = await categoriesAPI.getCategories({ active: activeOnly });
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    // Get product by ID
    const getProductById = async (id) => {
        try {
            return await productsAPI.getProductById(id);
        } catch (err) {
            console.error('Error fetching product:', err);
            throw err;
        }
    };

    // Load initial data — fire both requests in parallel, not sequentially
    useEffect(() => {
        Promise.all([
            fetchProducts({ active: 'true', limit: 12 }),
            fetchCategories(true)
        ]);
    }, []);

    const value = {
        products,
        categories,
        loading,
        error,
        pagination,
        fetchProducts,
        fetchCategories,
        getProductById
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within ProductProvider');
    }
    return context;
};

export default ProductContext;
