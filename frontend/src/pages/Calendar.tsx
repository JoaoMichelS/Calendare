import { useState, useEffect, useCallback } from 'react';
import { Container, Box, Paper, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import CalendarView from '../components/Calendar/CalendarView';
import EventModal from '../components/Calendar/EventModal';
import { eventsApi } from '../services/events.api';
import type { Event, CreateEventData, UpdateEventData } from '../types/event';

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDates, setSelectedDates] = useState<{ start: Date; end: Date } | null>(null);

  const loadEvents = useCallback(async (start?: Date, end?: Date) => {
    try {
      const filters = start && end ? {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      } : undefined;

      const data = await eventsApi.findAll(filters);
      setEvents(data);
    } catch (err: any) {
      setError('Erro ao carregar eventos');
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDateSelect = (start: Date, end: Date) => {
    setSelectedDates({ start, end });
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDates(null);
    setModalOpen(true);
  };

  const handleCreateEvent = async (data: CreateEventData) => {
    try {
      await eventsApi.create(data);
      setSuccess('Evento criado com sucesso!');
      setModalOpen(false);
      loadEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar evento');
    }
  };

  const handleUpdateEvent = async (id: number, data: UpdateEventData) => {
    try {
      await eventsApi.update(id, data);
      setSuccess('Evento atualizado com sucesso!');
      setModalOpen(false);
      loadEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar evento');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await eventsApi.remove(id);
      setSuccess('Evento deletado com sucesso!');
      setModalOpen(false);
      loadEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao deletar evento');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Minha Agenda
        </Typography>

        {initialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <CalendarView
            events={events}
            onDateSelect={handleDateSelect}
            onEventClick={handleEventClick}
            onDatesSet={(info) => loadEvents(info.start, info.end)}
          />
        )}
      </Paper>

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        initialDates={selectedDates}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}
