import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Text from '@/components/atoms/Text';

const StatCard = ({ label, value, iconName, iconColorClass, bgColorClass, footerText, motionDelay = 0 }) => {
    return (
        <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: motionDelay }}
            className="p-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <Text as="p" className="text-sm font-medium text-surface-600">
                        {label}
                    </Text>
                    <Text as="p" className="text-2xl font-bold text-surface-900">
                        {value}
                    </Text>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bgColorClass}`}>
                    <ApperIcon name={iconName} size={24} className={iconColorClass} />
                </div>
            </div>
            {footerText && (
                <Text as="p" className="text-xs text-surface-500 mt-2">
                    {footerText}
                </Text>
            )}
        </Card>
    );
};

export default StatCard;