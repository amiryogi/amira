import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '@/lib/socket';
import { CHAT_EVENTS } from '@amira/shared';
import type { IChatRoomPopulated } from '@amira/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, RefreshCw } from 'lucide-react';

function formatRelativeTime(date: string | Date | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function ChatListPage() {
  const [rooms, setRooms] = useState<IChatRoomPopulated[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchRooms = useCallback((): (() => void) | undefined => {
    setIsLoading(true);
    setError(null);

    try {
      const socket = socketService.connect();

      const handleConnect = () => {
        socket.emit(
          CHAT_EVENTS.GET_ROOMS,
          {},
          (response: { success?: boolean; rooms?: IChatRoomPopulated[]; error?: string }) => {
            setIsLoading(false);
            if (response.error) {
              setError(response.error);
              return;
            }
            if (response.rooms) {
              setRooms(response.rooms);
            }
          },
        );
      };

      const handleRoomUpdated = () => {
        // Re-fetch rooms on any update
        socket.emit(
          CHAT_EVENTS.GET_ROOMS,
          {},
          (response: { success?: boolean; rooms?: IChatRoomPopulated[] }) => {
            if (response.rooms) {
              setRooms(response.rooms);
            }
          },
        );
      };

      socket.on('connect', handleConnect);
      socket.on(CHAT_EVENTS.ROOM_UPDATED, handleRoomUpdated);

      if (socket.connected) {
        handleConnect();
      }

      return () => {
        socket.off('connect', handleConnect);
        socket.off(CHAT_EVENTS.ROOM_UPDATED, handleRoomUpdated);
      };
    } catch {
      setIsLoading(false);
      setError('Failed to connect to chat server');
      return undefined;
    }
  }, []);

  useEffect(() => {
    const cleanup = fetchRooms();
    return () => {
      cleanup?.();
      socketService.disconnect();
    };
  }, [fetchRooms]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat Support</h1>
          <p className="text-sm text-gray-500">Manage customer support conversations</p>
        </div>
        <Button variant="outline" onClick={fetchRooms} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-48 rounded bg-gray-100" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <MessageSquare className="h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">No active chat rooms</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => {
            const customer = room.customerId;
            const hasUnread = room.unreadCountAdmin > 0;

            return (
              <Card
                key={room._id}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  hasUnread ? 'border-blue-200 bg-blue-50/30' : ''
                }`}
                onClick={() => navigate(`/chat/${room._id}`)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                      {customer?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {customer?.name || 'Unknown Customer'}
                      </p>
                      <p className="text-xs text-gray-500">{customer?.email || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(room.lastMessageAt)}
                    </span>
                    {hasUnread && (
                      <Badge variant="info">
                        {room.unreadCountAdmin}
                      </Badge>
                    )}
                    <Badge variant={room.status === 'open' ? 'success' : 'secondary'}>
                      {room.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
