import { ProjectModel } from '../models/Project';
import { CreateProjectDto, UpdateProjectDto, Project } from '../types';
import { AppError } from '../middleware/errorHandler';
import { HttpStatus } from '../utils/constants';

export class ProjectService {
  static async createProject(userId: number, data: CreateProjectDto): Promise<Project> {
    return ProjectModel.create(data.name, data.description, userId);
  }

  static async getProjectById(projectId: number, userId: number): Promise<Project> {
    const project = await ProjectModel.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', HttpStatus.NOT_FOUND);
    }

    const isMember = await ProjectModel.isMember(projectId, userId);

    if (!isMember) {
      throw new AppError('Access denied', HttpStatus.FORBIDDEN);
    }

    return project;
  }

  static async getUserProjects(userId: number): Promise<Project[]> {
    return ProjectModel.findByUserId(userId);
  }

  static async updateProject(projectId: number, userId: number, data: UpdateProjectDto): Promise<Project> {
    const project = await ProjectModel.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', HttpStatus.NOT_FOUND);
    }

    const isOwner = await ProjectModel.isOwner(projectId, userId);

    if (!isOwner) {
      throw new AppError('Only project owner can update', HttpStatus.FORBIDDEN);
    }

    const updatedProject = await ProjectModel.update(projectId, data);

    if (!updatedProject) {
      throw new AppError('Failed to update project', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return updatedProject;
  }

  static async deleteProject(projectId: number, userId: number): Promise<void> {
    const project = await ProjectModel.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', HttpStatus.NOT_FOUND);
    }

    const isOwner = await ProjectModel.isOwner(projectId, userId);

    if (!isOwner) {
      throw new AppError('Only project owner can delete', HttpStatus.FORBIDDEN);
    }

    await ProjectModel.delete(projectId);
  }

  static async getProjectMembers(projectId: number, userId: number) {
    const isMember = await ProjectModel.isMember(projectId, userId);

    if (!isMember) {
      throw new AppError('Access denied', HttpStatus.FORBIDDEN);
    }

    return ProjectModel.getMembers(projectId);
  }

  static async addMember(projectId: number, userId: number, memberUserId: number) {
    const isOwner = await ProjectModel.isOwner(projectId, userId);

    if (!isOwner) {
      throw new AppError('Only project owner can add members', HttpStatus.FORBIDDEN);
    }

    const isMember = await ProjectModel.isMember(projectId, memberUserId);

    if (isMember) {
      throw new AppError('User is already a member', HttpStatus.CONFLICT);
    }

    return ProjectModel.addMember(projectId, memberUserId);
  }

  static async removeMember(projectId: number, userId: number, memberUserId: number) {
    const isOwner = await ProjectModel.isOwner(projectId, userId);

    if (!isOwner) {
      throw new AppError('Only project owner can remove members', HttpStatus.FORBIDDEN);
    }

    const removed = await ProjectModel.removeMember(projectId, memberUserId);

    if (!removed) {
      throw new AppError('Cannot remove project owner', HttpStatus.BAD_REQUEST);
    }
  }
}
