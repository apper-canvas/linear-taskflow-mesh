import tasksData from '../mockData/tasks.json';
import { isToday, isThisWeek, subDays, format } from 'date-fns';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const statsService = {
  async getAll() {
    await delay(250);
    
    // Get current tasks (this would normally come from taskService but for stats calculation we use the source data)
    const tasks = tasksData;
    const completedTasks = tasks.filter(task => task.completed);
    
    // Calculate today's completed tasks
    const completedToday = completedTasks.filter(task => 
      task.completedAt && isToday(new Date(task.completedAt))
    ).length;
    
    // Calculate this week's completed tasks
    const completedWeek = completedTasks.filter(task => 
      task.completedAt && isThisWeek(new Date(task.completedAt), { weekStartsOn: 1 })
    ).length;
    
    // Calculate completion rate
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    
    // Calculate current streak
    let streak = 0;
    let checkDate = new Date();
    
    // Check if there's a task completed today
    const hasTaskToday = completedTasks.some(task => 
      task.completedAt && format(new Date(task.completedAt), 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd')
    );

    if (!hasTaskToday) {
      checkDate = subDays(checkDate, 1);
    }

    // Count consecutive days with completed tasks
    while (streak < 365) { // Prevent infinite loop
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const hasTaskOnDate = completedTasks.some(task => 
        task.completedAt && format(new Date(task.completedAt), 'yyyy-MM-dd') === dateStr
      );

      if (hasTaskOnDate) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
    
    return {
      totalTasks: tasks.length,
      completedToday,
      completedWeek,
      streak,
      completionRate
    };
  }
};