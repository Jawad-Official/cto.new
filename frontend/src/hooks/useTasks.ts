import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Task, TaskStatus, TaskPriority } from '../types';
import { socketService } from '../services/socket';

interface TaskFilters {
  project_id?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: number;
}

export const useTasks = (filters?: TaskFilters) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.project_id) params.append('project_id', filters.project_id.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.assignee_id) params.append('assignee_id', filters.assignee_id.toString());

      const response = await api.get<{ tasks: Task[] }>(`/tasks?${params.toString()}`);
      setTasks(response.data.tasks);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTask = async (data: any) => {
    const response = await api.post<{ task: Task }>('/tasks', data);
    setTasks((prev) => [response.data.task, ...prev]);
    return response.data.task;
  };

  const updateTask = async (id: number, data: any) => {
    const response = await api.put<{ task: Task }>(`/tasks/${id}`, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? response.data.task : t)));
    return response.data.task;
  };

  const deleteTask = async (id: number) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    fetchTasks();

    const socket = socketService.getSocket();
    if (socket && filters?.project_id) {
      socket.on('task_created', (task: Task) => {
        if (task.project_id === filters.project_id) {
          setTasks((prev) => [task, ...prev]);
        }
      });

      socket.on('task_updated', (task: Task) => {
        if (task.project_id === filters.project_id) {
          setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
        }
      });

      socket.on('task_deleted', ({ taskId }: { taskId: number }) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      });

      return () => {
        socket.off('task_created');
        socket.off('task_updated');
        socket.off('task_deleted');
      };
    }
  }, [fetchTasks, filters?.project_id]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};
