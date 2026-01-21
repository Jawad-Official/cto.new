import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.forEach((users) => users.delete(client.id));
  }

  @SubscribeMessage('joinWorkspace')
  handleJoinWorkspace(client: Socket, workspaceId: string) {
    client.join(`workspace:${workspaceId}`);
    
    if (!this.connectedUsers.has(workspaceId)) {
      this.connectedUsers.set(workspaceId, new Set());
    }
    this.connectedUsers.get(workspaceId).add(client.id);
  }

  @SubscribeMessage('leaveWorkspace')
  handleLeaveWorkspace(client: Socket, workspaceId: string) {
    client.leave(`workspace:${workspaceId}`);
    this.connectedUsers.get(workspaceId)?.delete(client.id);
  }

  @SubscribeMessage('joinIssue')
  handleJoinIssue(client: Socket, issueId: string) {
    client.join(`issue:${issueId}`);
  }

  @SubscribeMessage('leaveIssue')
  handleLeaveIssue(client: Socket, issueId: string) {
    client.leave(`issue:${issueId}`);
  }

  emitToWorkspace(workspaceId: string, event: string, data: any) {
    this.server.to(`workspace:${workspaceId}`).emit(event, data);
  }

  emitToIssue(issueId: string, event: string, data: any) {
    this.server.to(`issue:${issueId}`).emit(event, data);
  }

  emitNotification(userId: string, notification: any) {
    this.server.emit(`notification:${userId}`, notification);
  }
}
