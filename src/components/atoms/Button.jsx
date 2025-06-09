import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ onClick, children, className, type = 'button', disabled = false, title, ...motionProps }) => {
    return (
        <motion.button
            onClick={onClick}
            className={className}
            type={type}
            disabled={disabled}
            title={title}
            {...motionProps}
        >
            {children}
        </motion.button>
    );
};

export default Button;