import api from './api';
import type { Event, CreateEventData, UpdateEventData, EventFilter } from '../types/event';

export const eventsApi = {
  // Criar evento
  create: async (data: CreateEventData): Promise<Event> => {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  // Listar eventos com filtros
  findAll: async (filters?: EventFilter): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events', { params: filters });
    return response.data;
  },

  // Buscar evento por ID
  findOne: async (id: number): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  // Atualizar evento
  update: async (id: number, data: UpdateEventData): Promise<Event> => {
    const response = await api.patch<Event>(`/events/${id}`, data);
    return response.data;
  },

  // Deletar evento
  remove: async (id: number): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  // Convidar usuários
  inviteUsers: async (eventId: number, emails: string[], canEdit?: boolean): Promise<any> => {
    const response = await api.post(`/events/${eventId}/invite`, { emails, canEdit });
    return response.data;
  },

  // Remover convite
  removeInvite: async (eventId: number, userId: number): Promise<void> => {
    await api.delete(`/events/${eventId}/invite/${userId}`);
  },

  // Responder a convite
  respondToInvite: async (eventId: number, status: 'ACCEPTED' | 'DECLINED'): Promise<any> => {
    const response = await api.patch(`/events/${eventId}/invite/respond`, { status });
    return response.data;
  },

  // Listar convites pendentes
  getPendingInvites: async (): Promise<any[]> => {
    const response = await api.get('/events/invites/pending');
    return response.data;
  },

  // Listar convites de um evento
  getEventInvites: async (eventId: number): Promise<any[]> => {
    const response = await api.get(`/events/${eventId}/invites`);
    return response.data;
  },
};
