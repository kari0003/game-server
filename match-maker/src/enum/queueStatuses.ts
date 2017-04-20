export type TQueueStatus = 'inactive' | 'idle' | 'matchesFound';

export const queueStatuses = {
  INACTIVE: 'inactive' as TQueueStatus,
  IDLE: 'idle' as TQueueStatus,
  MATCHES_FOUND: 'matchesFound' as TQueueStatus,
}
