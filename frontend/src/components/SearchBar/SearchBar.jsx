import React, { useState, useRef, useEffect } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = 'Search...', debounceMs = 400 }) => {
    const [value, setValue] = useState('');
    const debounceRef = useRef();

    useEffect(() => {
        // Debounce the search callback
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onSearch && onSearch(value.trim());
        }, debounceMs);
        return () => clearTimeout(debounceRef.current);
        // eslint-disable-next-line
    }, [value]);

    return (
        <div className="search-bar">
            <input
                className="search-bar__input"
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={placeholder}
                autoComplete="off"
            />
            <span className="search-bar__icon">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="#764ba2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
        </div>
    );
};

export default SearchBar; 