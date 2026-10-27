import { fetchApi, getApiBaseUrl } from './api';
import { ApiResponse, PagedResponse, RiskNotificationItem } from '@/types';

export const notificationService = {
  /**
   * Get paginated notifications scoped to user authority
   */
  async getNotifications(page = 0, size = 20): Promise<PagedResponse<RiskNotificationItem>> {
    const res = await fetchApi<ApiResponse<PagedResponse<RiskNotificationItem>>>(
      `/api/notifications?page=${page}&size=${size}`
    );
    return res.data;
  },

  /**
   * Get total count of unread high-priority notifications
   */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await fetchApi<ApiResponse<{ unreadCount: number }>>(
        '/api/notifications/unread-count'
      );
      return res.data?.unreadCount || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(id: number): Promise<void> {
    await fetchApi<ApiResponse<void>>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  /**
   * Mark all scoped notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await fetchApi<ApiResponse<void>>('/api/notifications/mark-all-read', {
      method: 'POST',
    });
  },

  /**
   * Connect to real-time SSE risk alert stream
   */
  connectSseStream(
    onNotification: (item: RiskNotificationItem) => void,
    onConnected?: () => void,
    onError?: (error: any) => void
  ): () => void {
    if (typeof window === 'undefined') return () => {};

    const token = localStorage.getItem('mplads_token');
    if (!token) return () => {};

    const url = `${getApiBaseUrl()}/api/notifications/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('CONNECTED', (event) => {
      onConnected?.();
    });

    eventSource.addEventListener('RISK_ALERT', (event) => {
      try {
        const item: RiskNotificationItem = JSON.parse(event.data);
        onNotification(item);
      } catch (e) {
        console.error('Failed to parse SSE RISK_ALERT payload:', e);
      }
    });

    eventSource.onerror = (err) => {
      onError?.(err);
    };

    return () => {
      eventSource.close();
    };
  },
};
