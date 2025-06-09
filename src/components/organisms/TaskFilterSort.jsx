import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Card from '@/components/atoms/Card';

const TaskFilterSort = ({ 
    searchQuery, setSearchQuery, 
    filter, setFilter, 
    selectedCategory, setSelectedCategory, 
    sortBy, setSortBy, 
    categories, 
    showFilterOptions = true,
    showSearch = true
}) => {
    return (
        <Card className="p-4 space-y-4">
            {(showSearch || showFilterOptions) &amp;&amp; (
                <div className="flex flex-col sm:flex-row gap-4">
                    {showSearch &amp;&amp; (
                        <div className="relative flex-1">
                            <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" />
                            <Input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full"
                            />
                        </div>
                    )}
                    {showFilterOptions &amp;&amp; (
                        <div className="flex flex-wrap gap-2">
                            {setFilter &amp;&amp; (
                                <Select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-3 py-2"
                                >
                                    <option value="all">All Tasks</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </Select>
                            )}
                            <Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </Select>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2"
                            >
                                <option value="dueDate">Sort by Due Date</option>
                                <option value="priority">Sort by Priority</option>
                                <option value="created">Sort by Created</option>
                            </Select>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default TaskFilterSort;