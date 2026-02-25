import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/games?search=${encodeURIComponent(query)}`);
            setQuery('');
        }
    };

    const handleClear = () => {
        setQuery('');
        inputRef.current?.focus();
    };

    return (
        <div className="search-wrapper">
            <style>{`
                .search-wrapper {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    padding: 16px 20px;
                }

                .search-form {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 15px 24px;
                    background: rgba(20, 25, 40, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(0, 217, 255, 0.2);
                    border-radius: 50px;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5),
                                0 0 0 1px rgba(0, 217, 255, 0.05),
                                inset 0 1px 0 rgba(255, 255, 255, 0.05);
                    width: 100%;
                    max-width: 560px;
                }

                .search-form:hover {
                    border-color: rgba(0, 217, 255, 0.35);
                    background: rgba(22, 28, 45, 0.9);
                    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6),
                                0 0 0 1px rgba(0, 217, 255, 0.1),
                                inset 0 1px 0 rgba(255, 255, 255, 0.08);
                }

                .search-form:focus-within {
                    border-color: rgba(0, 217, 255, 0.6);
                    background: rgba(25, 30, 50, 0.95);
                    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.7),
                                0 0 0 3px rgba(0, 217, 255, 0.12),
                                0 0 20px rgba(0, 217, 255, 0.15),
                                inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    transform: translateY(-1px);
                }

                .search-input {
                    flex: 1;
                    background: none;
                    border: none;
                    outline: none;
                    font-size: 15px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.98);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .search-input::placeholder {
                    color: rgba(150, 170, 190, 0.6);
                    font-weight: 400;
                }

                .search-icon {
                    color: rgba(0, 217, 255, 0.75);
                    flex-shrink: 0;
                    transition: color 0.2s;
                }

                .search-form:focus-within .search-icon {
                    color: rgba(0, 217, 255, 1);
                }

                .clear-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: none;
                    cursor: pointer;
                    color: rgba(255, 255, 255, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .clear-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: rgba(255, 255, 255, 0.9);
                    transform: scale(1.05);
                }

                .clear-btn:active {
                    transform: scale(0.95);
                }

                @media (max-width: 640px) {
                    .search-wrapper {
                        padding: 20px 16px;
                    }

                    .search-bar {
                        max-width: 100%;
                    }

                    .search-form {
                        padding: 13px 20px;
                        gap: 12px;
                    }

                    .search-input {
                        font-size: 14px;
                    }
                }
            `}</style>


            <form onSubmit={handleSubmit} className="search-form">
                <Search size={20} className="search-icon" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search games, DLCs, subscriptions..."
                    className="search-input"
                />
                {query && (
                    <button type="button" className="clear-btn" onClick={handleClear}>
                        <X size={16} />
                    </button>
                )}
            </form>
        </div>
    );
};

export default SearchBar;
