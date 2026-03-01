import { io, Socket } from 'socket.io-client';
import { CHAT_DEFAULTS } from '@amira/shared';
import { getAccessToken, setAccessToken } from './api';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_BASE_URL = __DEV__
  ? 'http://192.168.1.100:5000' // Same host as api.ts, without /api/v1
  : 'https://api.amira-woolens.com';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    const token = getAccessToken();
    if (!token) throw new Error('No auth token available');

    this.socket = io(`${API_BASE_URL}${CHAT_DEFAULTS.NAMESPACE}`, {
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
          // Refresh token using SecureStore refresh token
          const refreshToken = await SecureStore.getItemAsync('refreshToken');
          if (!refreshToken) {
            this.disconnect();
            return;
          }

          const { data } = await axios.post(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            { refreshToken },
          );
          const newToken = data.data.accessToken;
          const newRefresh = data.data.refreshToken;

          setAccessToken(newToken);
          if (newRefresh) {
            await SecureStore.setItemAsync('refreshToken', newRefresh);
          }

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
