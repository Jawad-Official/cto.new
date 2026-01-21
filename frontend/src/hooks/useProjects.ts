import { useState, useEffect } from 'react';
import api from '../services/api';
import { Project } from '../types';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ projects: Project[] }>('/projects');
      setProjects(response.data.projects);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: { name: string; description?: string }) => {
    const response = await api.post<{ project: Project }>('/projects', data);
    setProjects((prev) => [response.data.project, ...prev]);
    return response.data.project;
  };

  const updateProject = async (id: number, data: { name?: string; description?: string }) => {
    const response = await api.put<{ project: Project }>(`/projects/${id}`, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? response.data.project : p)));
    return response.data.project;
  };

  const deleteProject = async (id: number) => {
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};
