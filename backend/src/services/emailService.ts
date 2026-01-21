import { config } from '../config/env';
import { logger } from '../utils/logger';

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!config.email.smtpUser || !config.email.smtpPass) {
      logger.info('Email service not configured, skipping email send', { to, subject });
      return;
    }

    logger.info('Email would be sent (not implemented yet)', { to, subject });
  }

  static async sendTaskAssignedEmail(userEmail: string, userName: string, taskTitle: string): Promise<void> {
    const subject = 'You have been assigned a new task';
    const html = `
      <h1>New Task Assignment</h1>
      <p>Hi ${userName},</p>
      <p>You have been assigned to the task: <strong>${taskTitle}</strong></p>
      <p>Login to Appo to view details and start working on it.</p>
    `;

    await this.sendEmail(userEmail, subject, html);
  }

  static async sendCommentNotificationEmail(userEmail: string, userName: string, taskTitle: string, comment: string): Promise<void> {
    const subject = 'New comment on your task';
    const html = `
      <h1>New Comment</h1>
      <p>Hi ${userName},</p>
      <p>A new comment was added to the task: <strong>${taskTitle}</strong></p>
      <p>Comment: ${comment}</p>
      <p>Login to Appo to view and respond.</p>
    `;

    await this.sendEmail(userEmail, subject, html);
  }

  static async sendProjectInviteEmail(userEmail: string, userName: string, projectName: string): Promise<void> {
    const subject = 'You have been added to a project';
    const html = `
      <h1>Project Invitation</h1>
      <p>Hi ${userName},</p>
      <p>You have been added to the project: <strong>${projectName}</strong></p>
      <p>Login to Appo to start collaborating.</p>
    `;

    await this.sendEmail(userEmail, subject, html);
  }
}
