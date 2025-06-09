import React from 'react';

const Text = ({ as = 'p', children, className, ...props }) => {
    const Tag = as;
    return (
        <Tag className={className} {...props}>
            {children}
        </Tag>
    );
};

export default Text;