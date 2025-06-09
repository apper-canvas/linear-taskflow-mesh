import { format, isToday, isTomorrow, isPast } from 'date-fns';

export const formatDueDate = (dueDate, formatStr = 'MMM d') => {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date) &amp;&amp; !isToday(date)) return `Overdue (${format(date, formatStr)})`;
    return format(date, formatStr);
};

export const getDueDateColor = (dueDate) => {
    if (!dueDate) return 'text-surface-500';
    const date = new Date(dueDate);
    if (isPast(date) &amp;&amp; !isToday(date)) return 'text-red-600';
    if (isToday(date)) return 'text-accent-600';
    return 'text-surface-600';
};