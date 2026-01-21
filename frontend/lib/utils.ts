import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getPriorityColor(priority: string) {
  const colors = {
    URGENT: 'text-red-600 bg-red-50',
    HIGH: 'text-orange-600 bg-orange-50',
    MEDIUM: 'text-yellow-600 bg-yellow-50',
    LOW: 'text-blue-600 bg-blue-50',
    NONE: 'text-gray-600 bg-gray-50',
  };
  return colors[priority as keyof typeof colors] || colors.NONE;
}

export function getStatusColor(status: string) {
  const colors = {
    BACKLOG: 'text-gray-600 bg-gray-50',
    TODO: 'text-blue-600 bg-blue-50',
    IN_PROGRESS: 'text-yellow-600 bg-yellow-50',
    IN_REVIEW: 'text-purple-600 bg-purple-50',
    DONE: 'text-green-600 bg-green-50',
    CANCELLED: 'text-red-600 bg-red-50',
  };
  return colors[status as keyof typeof colors] || colors.BACKLOG;
}
