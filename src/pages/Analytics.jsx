import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import { taskService, categoryService, statsService } from '../services';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, subDays, addDays } from 'date-fns';

function Analytics() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, tasksData, categoriesData] = await Promise.all([
        statsService.getAll(),
        taskService.getAll(),
        categoryService.getAll()
      ]);
      setStats(statsData);
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyProgress = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysOfWeek.map(day => {
      const dayTasks = tasks.filter(task => 
        task.completedAt && 
        format(new Date(task.completedAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      return {
        day: format(day, 'EEE'),
        date: format(day, 'MMM d'),
        completed: dayTasks.length,
        isToday: isToday(day)
      };
    });
  };

  const getCategoryStats = () => {
    return categories.map(category => {
      const categoryTasks = tasks.filter(task => task.categoryId === category.id);
      const completedTasks = categoryTasks.filter(task => task.completed);
      
      return {
        ...category,
        total: categoryTasks.length,
        completed: completedTasks.length,
        percentage: categoryTasks.length > 0 ? Math.round((completedTasks.length / categoryTasks.length) * 100) : 0
      };
    }).filter(cat => cat.total > 0);
  };

  const getPriorityStats = () => {
    const priorities = [
      { level: 3, label: 'High', color: 'text-accent-600' },
      { level: 2, label: 'Medium', color: 'text-yellow-600' },
      { level: 1, label: 'Low', color: 'text-green-600' }
    ];

    return priorities.map(priority => {
      const priorityTasks = tasks.filter(task => task.priority === priority.level);
      const completedTasks = priorityTasks.filter(task => task.completed);
      
      return {
        ...priority,
        total: priorityTasks.length,
        completed: completedTasks.length,
        percentage: priorityTasks.length > 0 ? Math.round((completedTasks.length / priorityTasks.length) * 100) : 0
      };
    }).filter(p => p.total > 0);
  };

  const getStreakInfo = () => {
    const sortedCompletedTasks = tasks
      .filter(task => task.completed && task.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    let currentStreak = 0;
    let checkDate = new Date();
    
    // Check if there's a task completed today
    const hasTaskToday = sortedCompletedTasks.some(task => 
      format(new Date(task.completedAt), 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd')
    );

    if (!hasTaskToday) {
      checkDate = subDays(checkDate, 1);
    }

    // Count consecutive days with completed tasks
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const hasTaskOnDate = sortedCompletedTasks.some(task => 
        format(new Date(task.completedAt), 'yyyy-MM-dd') === dateStr
      );

      if (hasTaskOnDate) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return {
      current: currentStreak,
      needsTaskToday: !hasTaskToday && isToday(addDays(checkDate, 1))
    };
  };

  const weeklyProgress = getWeeklyProgress();
  const categoryStats = getCategoryStats();
  const priorityStats = getPriorityStats();
  const streakInfo = getStreakInfo();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-surface-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-surface-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-surface-200 rounded w-1/2"></div>
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
          <h3 className="text-lg font-medium text-surface-900 mb-2">Error Loading Analytics</h3>
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
          <h1 className="text-2xl font-heading font-bold text-surface-900">Analytics</h1>
          <p className="text-surface-600">Track your productivity and progress</p>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600">Total Tasks</p>
                <p className="text-3xl font-bold text-surface-900">{stats.totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="CheckSquare" size={24} className="text-primary-600" />
              </div>
            </div>
            <p className="text-xs text-surface-500 mt-2">All time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600">Completion Rate</p>
                <p className="text-3xl font-bold text-green-600">{Math.round(stats.completionRate)}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="TrendingUp" size={24} className="text-green-600" />
              </div>
            </div>
            <p className="text-xs text-surface-500 mt-2">Overall performance</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600">Current Streak</p>
                <p className="text-3xl font-bold text-accent-600">{streakInfo.current}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Flame" size={24} className="text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-surface-500 mt-2">
              {streakInfo.needsTaskToday ? 'Complete a task today!' : 'Days in a row'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600">This Week</p>
                <p className="text-3xl font-bold text-primary-600">{stats.completedWeek}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Calendar" size={24} className="text-primary-600" />
              </div>
            </div>
            <p className="text-xs text-surface-500 mt-2">Tasks completed</p>
          </motion.div>
        </div>
      )}

      {/* Weekly Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg p-6 shadow-sm"
      >
        <h3 className="text-lg font-heading font-semibold text-surface-900 mb-6">Weekly Progress</h3>
        <div className="grid grid-cols-7 gap-4">
          {weeklyProgress.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`text-center p-4 rounded-lg transition-all duration-200 ${
                day.isToday ? 'bg-primary-50 border-2 border-primary-200' : 'bg-surface-50'
              }`}
            >
              <p className="text-sm font-medium text-surface-600">{day.day}</p>
              <p className="text-xs text-surface-500 mb-2">{day.date}</p>
              <div className={`text-2xl font-bold ${
                day.completed > 0 ? 'text-green-600' : 'text-surface-300'
              }`}>
                {day.completed}
              </div>
              <p className="text-xs text-surface-500">
                {day.completed === 1 ? 'task' : 'tasks'}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <h3 className="text-lg font-heading font-semibold text-surface-900 mb-6">Category Performance</h3>
          {categoryStats.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Folder" className="w-12 h-12 text-surface-300 mx-auto mb-2" />
              <p className="text-surface-500">No category data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full bg-${category.color}`}></div>
                    <span className="font-medium text-surface-900">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-surface-900">
                      {category.completed}/{category.total}
                    </p>
                    <p className="text-xs text-surface-500">{category.percentage}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Priority Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <h3 className="text-lg font-heading font-semibold text-surface-900 mb-6">Priority Breakdown</h3>
          {priorityStats.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="AlertTriangle" className="w-12 h-12 text-surface-300 mx-auto mb-2" />
              <p className="text-surface-500">No priority data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {priorityStats.map((priority, index) => (
                <motion.div
                  key={priority.level}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <ApperIcon 
                      name={priority.level === 3 ? "AlertTriangle" : priority.level === 2 ? "Clock" : "CheckCircle"} 
                      size={16} 
                      className={priority.color} 
                    />
                    <span className="font-medium text-surface-900">{priority.label} Priority</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-surface-900">
                      {priority.completed}/{priority.total}
                    </p>
                    <p className="text-xs text-surface-500">{priority.percentage}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Analytics;