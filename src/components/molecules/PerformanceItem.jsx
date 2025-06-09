import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Text from '@/components/atoms/Text';

const PerformanceItem = ({ label, completed, total, percentage, dotColorClass, iconName, iconColorClass, motionDelay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: motionDelay }}
            className="flex items-center justify-between"
        >
            <div className="flex items-center space-x-3">
                {dotColorClass && <div className={`w-4 h-4 rounded-full ${dotColorClass}`}></div>}
                {iconName && <ApperIcon name={iconName} size={16} className={iconColorClass} />}
                <Text as="span" className="font-medium text-surface-900">
                    {label}
                </Text>
            </div>
            <div className="text-right">
                <Text as="p" className="text-sm font-medium text-surface-900">
                    {completed}/{total}
                </Text>
                <Text as="p" className="text-xs text-surface-500">
                    {percentage}%
                </Text>
            </div>
        </motion.div>
    );
};

export default PerformanceItem;