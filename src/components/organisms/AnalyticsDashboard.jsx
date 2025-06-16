import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Text from '@/components/atoms/Text';
import Card from '@/components/atoms/Card';
import StatCard from '@/components/molecules/StatCard';
import WeeklyProgressDay from '@/components/molecules/WeeklyProgressDay';
import PerformanceItem from '@/components/molecules/PerformanceItem';
import { taskService, categoryService, statsService } from '@/services';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, subDays, addDays } from 'date-fns';

function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          <Text as="h3" className="text-lg font-medium text-surface-900 mb-2">Error Loading Analytics</Text>
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
          <Text as="h1" className="text-2xl font-heading font-bold text-surface-900">Analytics</Text>
          <Text as="p" className="text-surface-600">Track your productivity and progress</Text>
        </div>
      </div>
{/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Tasks"
            value={stats.totalTasks}
            iconName="CheckSquare"
            iconColorClass="text-primary-600"
            bgColorClass="bg-primary-100"
            footerText="All time"
            motionDelay={0}
          />

          <StatCard
            label="Completion Rate"
            value={`${Math.round(stats.completionRate)}%`}
            iconName="TrendingUp"
            iconColorClass="text-green-600"
            bgColorClass="bg-green-100"
            footerText="Overall performance"
            motionDelay={0.1}
          />

          <StatCard
            label="Current Streak"
            value={streakInfo.current}
            iconName="Flame"
            iconColorClass="text-yellow-600"
            bgColorClass="bg-yellow-100"
            footerText={streakInfo.needsTaskToday ? 'Complete a task today!' : 'Days in a row'}
            motionDelay={0.2}
          />

          <StatCard
            label="This Week"
            value={stats.completedWeek}
            iconName="Calendar"
            iconColorClass="text-primary-600"
            bgColorClass="bg-primary-100"
            footerText="Tasks completed"
            motionDelay={0.3}
          />
        </div>
      )}

      {/* Weekly Progress Chart */}
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Text as="h3" className="text-lg font-heading font-semibold text-surface-900 mb-6">Weekly Progress</Text>
        <div className="grid grid-cols-7 gap-4">
          {weeklyProgress.map((day, index) => (
            <WeeklyProgressDay
              key={day.day}
              dayName={day.day}
              date={day.date}
              completedCount={day.completed}
              isToday={day.isToday}
              motionDelay={0.5 + index * 0.1}
            />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Text as="h3" className="text-lg font-heading font-semibold text-surface-900 mb-6">Category Performance</Text>
          {categoryStats.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Folder" className="w-12 h-12 text-surface-300 mx-auto mb-2" />
              <Text as="p" className="text-surface-500">No category data available</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((category, index) => (
                <PerformanceItem
                  key={category.id}
                  label={category.name}
                  completed={category.completed}
                  total={category.total}
                  percentage={category.percentage}
                  dotColorClass={`bg-${category.color}`}
                  motionDelay={0.7 + index * 0.1}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Priority Breakdown */}
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Text as="h3" className="text-lg font-heading font-semibold text-surface-900 mb-6">Priority Breakdown</Text>
          {priorityStats.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="AlertTriangle" className="w-12 h-12 text-surface-300 mx-auto mb-2" />
              <Text as="p" className="text-surface-500">No priority data available</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {priorityStats.map((priority, index) => (
                <PerformanceItem
                  key={priority.level}
                  label={`${priority.label} Priority`}
                  completed={priority.completed}
                  total={priority.total}
                  percentage={priority.percentage}
                  iconName={priority.level === 3 ? "AlertTriangle" : priority.level === 2 ? "Clock" : "CheckCircle"}
                  iconColorClass={priority.color}
                  motionDelay={0.9 + index * 0.1}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;