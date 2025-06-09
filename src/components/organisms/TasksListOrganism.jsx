import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Text from '@/components/atoms/Text';
import TaskListItem from '@/components/molecules/TaskListItem';
import TaskFilterSort from '@/components/organisms/TaskFilterSort';
import { taskService, categoryService } from '@/services';
import { isPast } from 'date-fns';

function TasksListOrganism() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('active'); // active, completed, all
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = await taskService.update(taskId, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      });
      
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      
      if (updatedTask.completed) {
        toast.success('Task completed! 🎉');
      } else {
        toast.success('Task marked as incomplete');
      }
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleArchiveTask = async (taskId) => {
    try {
      const updatedTask = await taskService.update(taskId, { archived: true });
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      toast.success('Task archived');
    } catch (err) {
      toast.error('Failed to archive task');
    }
  };

  const filteredTasks = tasks
    .filter(task => !task.archived)
    .filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .filter(task => selectedCategory === 'all' || task.categoryId === selectedCategory)
    .filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate &amp;&amp; !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'priority') {
        return b.priority - a.priority;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const getTaskStats = () => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.completed).length;
    const overdue = filteredTasks.filter(t => t.dueDate &amp;&amp; isPast(new Date(t.dueDate)) &amp;&amp; !t.completed).length;
    return { total, completed, overdue };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-surface-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-surface-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-5 h-5 bg-surface-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-surface-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-surface-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <Text as="h3" className="text-lg font-medium text-surface-900 mb-2">Error Loading Tasks</Text>
          <Text as="p" className="text-surface-600 mb-4">{error}</Text>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadData}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <Text as="h1" className="text-2xl font-heading font-bold text-surface-900">All Tasks</Text>
          <Text as="p" className="text-surface-600">
            {stats.total} tasks • {stats.completed} completed • {stats.overdue} overdue
          </Text>
        </div>
      </div>

      {/* Filters and Search */}
      <TaskFilterSort
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        showFilterOptions={true}
        showSearch={true}
      />

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="Search" className="w-16 h-16 text-surface-300 mx-auto" />
          </motion.div>
          <Text as="h3" className="mt-4 text-lg font-medium text-surface-900">No tasks found</Text>
          <Text as="p" className="mt-2 text-surface-500">
            {searchQuery ? 'Try adjusting your search or filters' : 'Create your first task to get started'}
          </Text>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <TaskListItem
                key={task.id}
                task={task}
                categories={categories}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onArchive={handleArchiveTask}
                motionDelay={index * 0.05}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default TasksListOrganism;