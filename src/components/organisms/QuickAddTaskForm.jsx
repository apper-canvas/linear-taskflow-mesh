import React from 'react';
import { motion } from 'framer-motion';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';

const QuickAddTaskForm = ({ newTask, setNewTask, categories, onCreateTask, onCancel }) => {
    return (
        <Card className="p-6">
            <form onSubmit={onCreateTask} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        type="text"
                        placeholder="Task title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        required
                    />
                    <Select
                        value={newTask.categoryId}
                        onChange={(e) => setNewTask({ ...newTask, categoryId: e.target.value })}
                    >
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </Select>
                </div>

                <Textarea
                    placeholder="Description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={2}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                    <Select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
                    >
                        <option value={1}>Low Priority</option>
                        <option value={2}>Medium Priority</option>
                        <option value={3}>High Priority</option>
                    </Select>
                </div>

                <div className="flex justify-end space-x-3">
                    <Button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onCancel}
                        className="px-4 py-2 text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors duration-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                    >
                        Create Task
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default QuickAddTaskForm;