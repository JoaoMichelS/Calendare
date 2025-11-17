export interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  color: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  recurrenceEndDate?: string;
  reminders?: number[];
  userId: number;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  invites?: EventInvite[];
  createdAt: string;
  updatedAt: string;
  // Para instâncias de eventos recorrentes
  isRecurringInstance?: boolean;
  originalEventId?: number;
}

export interface EventInvite {
  id: number;
  eventId: number;
  userId: number;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  canEdit: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  color?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  recurrenceEndDate?: string;
  reminders?: number[];
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface EventFilter {
  startDate?: string;
  endDate?: string;
  userId?: number;
}
