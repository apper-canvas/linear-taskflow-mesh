import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className, ...motionProps }) => {
    return (
        <motion.div
            className={`bg-white rounded-lg p-6 shadow-sm ${className || ''}`}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
};

export default Card;