import React from 'react';

const Input = ({ type = 'text', value, onChange, placeholder, className, required = false, ...props }) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`px-4 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${className || ''}`}
            required={required}
            {...props}
        />
    );
};

export default Input;