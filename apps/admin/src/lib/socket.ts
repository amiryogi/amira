import { io, Socket } from 'socket.io-client';
import { CHAT_DEFAULTS } from '@amira/shared';
import { getAccessToken, setAccessToken } from '@/providers/api';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    const token = getAccessToken();
    if (!token) throw new Error('No auth token available');

    const baseUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace('/api/v1', '') ||
      '';

    this.socket = io(`${baseUrl}${CHAT_DEFAULTS.NAMESPACE}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect_error', async (error) => {
      if (
        error.message.includes('Authentication') &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnectAttempts++;
        try {
          const { data } = await (await import('axios')).default.post(
            '/api/v1/auth/refresh',
            {},
            { withCredentials: true },
          );
          const newToken = data.data.accessToken;
          setAccessToken(newToken);
          if (newToken && this.socket) {
            this.socket.auth = { token: newToken };
            this.socket.connect();
          }
        } catch {
          this.disconnect();
        }
      }
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
    });

    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.reconnectAttempts = 0;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
