import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Text from '@/components/atoms/Text';
import StatCard from '@/components/molecules/StatCard';
import TaskListItem from '@/components/molecules/TaskListItem';
import QuickAddTaskForm from '@/components/organisms/QuickAddTaskForm';
import TaskFilterSort from '@/components/organisms/TaskFilterSort';
import { taskService, categoryService, statsService } from '@/services';
import { formatDueDate, getDueDateColor } from '@/utils/dateHelpers';
import { PRIORITY_LABELS } from '@/config/constants';

function DashboardOverview() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 2,
    dueDate: ''
  });
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, categoriesData, statsData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll(),
        statsService.getAll()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
      setStats(statsData);
      // Set default category for new task if categories exist
      if (categoriesData.length > 0 &amp;&amp; !newTask.categoryId) {
        setNewTask(prev => ({ ...prev, categoryId: categoriesData[0].id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      const taskData = {
        ...newTask,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null, // Ensure ISO string
        categoryId: newTask.categoryId || categories[0]?.id // Fallback to first category if none selected
      };
      
      const createdTask = await taskService.create(taskData);
      setTasks([createdTask, ...tasks]);
      setNewTask({
        title: '',
        description: '',
        categoryId: categories[0]?.id || '', // Reset to default category
        priority: 2,
        dueDate: ''
      });
      setShowQuickAdd(false);
      toast.success('Task created successfully!');
      
      // Update stats
      const updatedStats = await statsService.getAll();
      setStats(updatedStats);
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = await taskService.update(taskId, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null // Ensure ISO string
      });
      
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      
      if (updatedTask.completed) {
        toast.success('Task completed! 🎉');
      } else {
        toast.success('Task marked as incomplete');
      }
      
      // Update stats
      const updatedStats = await statsService.getAll();
      setStats(updatedStats);
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted');
      
      // Update stats
      const updatedStats = await statsService.getAll();
      setStats(updatedStats);
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks
    .filter(task => !task.archived) // Dashboard only shows active tasks
    .filter(task => !task.completed) // Dashboard only shows uncompleted tasks by default
    .filter(task => selectedCategory === 'all' || task.categoryId === selectedCategory)
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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-surface-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-surface-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        
        {/* Tasks Skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-center space-x-4">
                <div className="w-5 h-5 bg-surface-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-surface-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-surface-200 rounded w-1/2"></div>
                </div>
              </div>
            </motion.div>
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
      {/* Stats Dashboard */}
      {stats &amp;&amp; (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Tasks"
            value={stats.totalTasks}
            iconName="CheckSquare"
            iconColorClass="text-primary-600"
            bgColorClass="bg-primary-100"
            motionDelay={0}
          />
          <StatCard
            label="Completed Today"
            value={stats.completedToday}
            iconName="CheckCircle"
            iconColorClass="text-green-600"
            bgColorClass="bg-green-100"
            motionDelay={0.1}
          />
          <StatCard
            label="This Week"
            value={stats.completedWeek}
            iconName="Calendar"
            iconColorClass="text-accent-600"
            bgColorClass="bg-accent-100"
            motionDelay={0.2}
          />
          <StatCard
            label="Streak"
            value={`${stats.streak} days`}
            iconName="Flame"
            iconColorClass="text-yellow-600"
            bgColorClass="bg-yellow-100"
            motionDelay={0.3}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-wrap items-center gap-4">
          <TaskFilterSort
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showFilterOptions={false} // Only show category and sort for dashboard
            showSearch={false}
          />
        </div>

        <Button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
        >
          <ApperIcon name="Plus" size={16} />
          <Text as="span">Add Task</Text>
        </Button>
      </div>

      {/* Quick Add Form */}
      <AnimatePresence>
        {showQuickAdd &amp;&amp; (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <QuickAddTaskForm
                newTask={newTask}
                setNewTask={setNewTask}
                categories={categories}
                onCreateTask={handleCreateTask}
                onCancel={() => setShowQuickAdd(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
            <ApperIcon name="CheckSquare" className="w-16 h-16 text-surface-300 mx-auto" />
          </motion.div>
          <Text as="h3" className="mt-4 text-lg font-medium text-surface-900">No tasks yet</Text>
          <Text as="p" className="mt-2 text-surface-500">Create your first task to get started with productivity</Text>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQuickAdd(true)}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            Add Your First Task
          </Button>
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
                motionDelay={index * 0.05}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default DashboardOverview;