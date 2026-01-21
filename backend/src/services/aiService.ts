import { TaskModel } from '../models/Task';
import { ProjectModel } from '../models/Project';
import { TaskPriority } from '../types';

export class AIService {
  static async suggestPriority(title: string, description?: string): Promise<TaskPriority> {
    const text = `${title} ${description || ''}`.toLowerCase();

    const highPriorityKeywords = ['urgent', 'critical', 'asap', 'immediately', 'emergency', 'bug', 'production', 'security', 'breach'];
    const lowPriorityKeywords = ['minor', 'optional', 'future', 'nice to have', 'enhancement', 'documentation'];

    const hasHighPriority = highPriorityKeywords.some(keyword => text.includes(keyword));
    const hasLowPriority = lowPriorityKeywords.some(keyword => text.includes(keyword));

    if (hasHighPriority) return 'HIGH';
    if (hasLowPriority) return 'LOW';
    
    return 'MEDIUM';
  }

  static async autoAssignTask(projectId: number): Promise<number | null> {
    const members = await ProjectModel.getMembers(projectId);

    if (members.length === 0) {
      return null;
    }

    const memberWorkloads = await Promise.all(
      members.map(async (member) => {
        const taskCount = await TaskModel.getUserTaskCount(member.id);
        return { userId: member.id, taskCount };
      })
    );

    memberWorkloads.sort((a, b) => a.taskCount - b.taskCount);

    return memberWorkloads[0].userId;
  }

  static async analyzeTaskComplexity(title: string, description?: string): Promise<'simple' | 'moderate' | 'complex'> {
    const text = `${title} ${description || ''}`;
    const wordCount = text.split(/\s+/).length;

    const complexKeywords = ['integrate', 'architecture', 'refactor', 'migrate', 'implement', 'design system'];
    const hasComplexKeywords = complexKeywords.some(keyword => text.toLowerCase().includes(keyword));

    if (wordCount > 100 || hasComplexKeywords) return 'complex';
    if (wordCount > 30) return 'moderate';
    
    return 'simple';
  }

  static async suggestDueDate(priority: TaskPriority, complexity: 'simple' | 'moderate' | 'complex'): Promise<Date> {
    const now = new Date();
    let daysToAdd = 7;

    if (priority === 'HIGH') {
      daysToAdd = complexity === 'simple' ? 2 : complexity === 'moderate' ? 3 : 5;
    } else if (priority === 'MEDIUM') {
      daysToAdd = complexity === 'simple' ? 5 : complexity === 'moderate' ? 7 : 10;
    } else {
      daysToAdd = complexity === 'simple' ? 10 : complexity === 'moderate' ? 14 : 21;
    }

    now.setDate(now.getDate() + daysToAdd);
    return now;
  }
}
