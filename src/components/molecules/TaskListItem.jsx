import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Text from '@/components/atoms/Text';
import Card from '@/components/atoms/Card';
import { formatDueDate, getDueDateColor } from '@/utils/dateHelpers';
import { PRIORITY_LABELS } from '@/config/constants';

const TaskListItem = ({ task, categories, onToggleComplete, onDelete, onArchive, motionDelay = 0 }) => {
    const category = categories.find(c => c.id === task.categoryId);
    const priority = PRIORITY_LABELS[task.priority];

    return (
        <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: motionDelay }}
            whileHover={{ scale: 1.01, y: -2 }}
            className={`p-4 hover:shadow-md transition-all duration-200 border-l-4 ${
                task.completed 
                    ? 'opacity-60 border-l-green-500' 
                    : `border-l-${category?.color || 'primary-500'}`
            }`}
        >
            <div className="flex items-start space-x-4">
                <Button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onToggleComplete(task.id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                        task.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-surface-300 hover:border-primary-500'
                    }`}
                >
                    {task.completed && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 15 }}
                        >
                            <ApperIcon name="Check" size={12} className="text-white" />
                        </motion.div>
                    )}
                </Button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <Text as="h3" className={`font-medium break-words ${
                            task.completed ? 'line-through text-surface-500' : 'text-surface-900'
                        }`}>
                            {task.title}
                        </Text>
                        <div className="flex items-center space-x-2 ml-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priority.color}`}>
                                {priority.label}
                            </span>
                            {category && (
                                <span className="px-2 py-1 text-xs font-medium bg-surface-100 text-surface-700 rounded-full">
                                    {category.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {task.description && (
                        <Text as="p" className={`text-sm break-words mb-2 ${
                            task.completed ? 'text-surface-400' : 'text-surface-600'
                        }`}>
                            {task.description}
                        </Text>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                            {task.dueDate && (
                                <span className={`flex items-center space-x-1 ${getDueDateColor(task.dueDate)}`}>
                                    <ApperIcon name="Calendar" size={14} />
                                    <Text as="span">{formatDueDate(task.dueDate)}</Text>
                                </span>
                            )}
                            <Text as="span" className="text-surface-500">
                                Created {formatDueDate(task.createdAt, 'MMM d')}
                            </Text>
                        </div>

                        <div className="flex items-center space-x-2">
                            {onArchive && (
                                <Button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onArchive(task.id)}
                                    className="p-1 text-surface-400 hover:text-blue-500 transition-colors duration-200"
                                    title="Archive task"
                                >
                                    <ApperIcon name="Archive" size={16} />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onDelete(task.id)}
                                    className="p-1 text-surface-400 hover:text-red-500 transition-colors duration-200"
                                    title="Delete task"
                                >
                                    <ApperIcon name="Trash2" size={16} />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default TaskListItem;