export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export const UserRole = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export const ProjectRole = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
} as const;

export const NotificationType = {
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_DUE_SOON: 'TASK_DUE_SOON',
  COMMENT_ADDED: 'COMMENT_ADDED',
  PROJECT_INVITE: 'PROJECT_INVITE',
  MENTION: 'MENTION',
} as const;

export const SocketEvents = {
  JOIN_PROJECT: 'join_project',
  LEAVE_PROJECT: 'leave_project',
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_DELETED: 'task_deleted',
  COMMENT_ADDED: 'comment_added',
  NOTIFICATION: 'notification',
} as const;

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
