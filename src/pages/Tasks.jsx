import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import { taskService, categoryService } from '../services';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { formatDueDate, getDueDateColor } from '@/utils/dateHelpers';
function Tasks() {
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
        completedAt: !task.completed ? new Date() : null
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
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'priority') {
        return b.priority - a.priority;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const priorityLabels = {
    1: { label: 'Low', color: 'bg-green-100 text-green-700 border-green-200' },
    2: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    3: { label: 'High', color: 'bg-accent-100 text-accent-700 border-accent-200' }
};
  const getTaskStats = () => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.completed).length;
    const overdue = filteredTasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !t.completed).length;
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
          <h3 className="text-lg font-medium text-surface-900 mb-2">Error Loading Tasks</h3>
          <p className="text-surface-600 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadData}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-heading font-bold text-surface-900">All Tasks</h1>
          <p className="text-surface-600">
            {stats.total} tasks • {stats.completed} completed • {stats.overdue} overdue
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Tasks</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="created">Sort by Created</option>
            </select>
          </div>
        </div>
      </div>

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
          <h3 className="mt-4 text-lg font-medium text-surface-900">No tasks found</h3>
          <p className="mt-2 text-surface-500">
            {searchQuery ? 'Try adjusting your search or filters' : 'Create your first task to get started'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTasks.map((task, index) => {
              const category = categories.find(c => c.id === task.categoryId);
              const priority = priorityLabels[task.priority];
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${
                    task.completed 
                      ? 'opacity-60 border-l-green-500' 
                      : `border-l-${category?.color || 'primary-500'}`
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleComplete(task.id)}
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
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-medium break-words ${
                          task.completed ? 'line-through text-surface-500' : 'text-surface-900'
                        }`}>
                          {task.title}
                        </h3>
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
                        <p className={`text-sm break-words mb-2 ${
                          task.completed ? 'text-surface-400' : 'text-surface-600'
                        }`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          {task.dueDate && (
                            <span className={`flex items-center space-x-1 ${getDueDateColor(task.dueDate)}`}>
                              <ApperIcon name="Calendar" size={14} />
                              <span>{formatDueDate(task.dueDate)}</span>
                            </span>
                          )}
                          <span className="text-surface-500">
                            Created {format(new Date(task.createdAt), 'MMM d')}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleArchiveTask(task.id)}
                            className="p-1 text-surface-400 hover:text-blue-500 transition-colors duration-200"
                            title="Archive task"
                          >
                            <ApperIcon name="Archive" size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-surface-400 hover:text-red-500 transition-colors duration-200"
                            title="Delete task"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default Tasks;