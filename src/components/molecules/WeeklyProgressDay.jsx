import React from 'react';
import { motion } from 'framer-motion';
import Text from '@/components/atoms/Text';

const WeeklyProgressDay = ({ dayName, date, completedCount, isToday, motionDelay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: motionDelay }}
            className={`text-center p-4 rounded-lg transition-all duration-200 ${
                isToday ? 'bg-primary-50 border-2 border-primary-200' : 'bg-surface-50'
            }`}
        >
            <Text as="p" className="text-sm font-medium text-surface-600">
                {dayName}
            </Text>
            <Text as="p" className="text-xs text-surface-500 mb-2">
                {date}
            </Text>
            <Text as="div" className={`text-2xl font-bold ${
                completedCount > 0 ? 'text-green-600' : 'text-surface-300'
            }`}>
                {completedCount}
            </Text>
            <Text as="p" className="text-xs text-surface-500">
                {completedCount === 1 ? 'task' : 'tasks'}
            </Text>
        </motion.div>
    );
};

export default WeeklyProgressDay;