import React from 'react';

const Select = ({ value, onChange, children, className, ...props }) => {
    return (
        <select
            value={value}
            onChange={onChange}
            className={`px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${className || ''}`}
            {...props}
        >
            {children}
        </select>
    );
};

export default Select;