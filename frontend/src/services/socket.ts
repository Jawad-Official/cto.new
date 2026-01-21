import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { storage } from './storage';

let socket: Socket | null = null;

export const socketService = {
  connect(): Socket {
    const token = storage.getToken();
    
    if (!socket) {
      socket = io(SOCKET_URL, {
        auth: { token },
      });
    }

    return socket;
  },

  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket(): Socket | null {
    return socket;
  },

  joinProject(projectId: number): void {
    socket?.emit('join_project', projectId);
  },

  leaveProject(projectId: number): void {
    socket?.emit('leave_project', projectId);
  },

  on(event: string, callback: (...args: any[]) => void): void {
    socket?.on(event, callback);
  },

  off(event: string, callback?: (...args: any[]) => void): void {
    socket?.off(event, callback);
  },
};
