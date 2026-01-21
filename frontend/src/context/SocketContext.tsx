import { createContext, useContext, useEffect, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  joinProject: (projectId: number) => void;
  leaveProject: (projectId: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socket = socketService.connect();
      
      return () => {
        socketService.disconnect();
      };
    }
  }, [user]);

  const joinProject = (projectId: number) => {
    socketService.joinProject(projectId);
  };

  const leaveProject = (projectId: number) => {
    socketService.leaveProject(projectId);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketService.getSocket(),
        joinProject,
        leaveProject,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
