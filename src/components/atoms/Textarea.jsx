import React from 'react';

const Textarea = ({ value, onChange, placeholder, rows = 2, className, ...props }) => {
    return (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-4 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${className || ''}`}
            {...props}
        />
    );
};

export default Textarea;