import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Badge,
} from '@mui/material';
import { Mail as MailIcon, Close as CloseIcon } from '@mui/icons-material';
import CalendarView from '../components/Calendar/CalendarView';
import EventModal from '../components/Calendar/EventModal';
import PendingInvites from '../components/Calendar/PendingInvites';
import { eventsApi } from '../services/events.api';
import type { Event, CreateEventData, UpdateEventData } from '../types/event';
import { useAuth } from '../contexts/AuthContext';

export default function Calendar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDates, setSelectedDates] = useState<{ start: Date; end: Date } | null>(null);

  // Invites drawer state
  const [invitesDrawerOpen, setInvitesDrawerOpen] = useState(false);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);

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

  const loadPendingInvitesCount = useCallback(async () => {
    try {
      const invites = await eventsApi.getPendingInvites();
      setPendingInvitesCount(invites.length);
    } catch (err) {
      console.error('Erro ao carregar convites pendentes:', err);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    loadPendingInvitesCount();
  }, [loadEvents, loadPendingInvitesCount]);

  const handleInviteResponded = () => {
    loadEvents();
    loadPendingInvitesCount();
    setSuccess('Convite respondido com sucesso!');
  };

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

  const handleCreateEvent = async (data: CreateEventData, inviteEmails?: string[], canEdit?: boolean) => {
    try {
      const createdEvent = await eventsApi.create(data);

      // Se houver emails para convidar, enviar convites
      if (inviteEmails && inviteEmails.length > 0) {
        try {
          await eventsApi.inviteUsers(createdEvent.id, inviteEmails, canEdit);
          setSuccess('Evento criado e convites enviados com sucesso!');
        } catch (inviteErr: any) {
          setSuccess('Evento criado com sucesso!');
          setError(inviteErr.response?.data?.message || 'Erro ao enviar convites');
        }
      } else {
        setSuccess('Evento criado com sucesso!');
      }

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
    <Container
      maxWidth="lg"
      sx={{
        mt: isMobile ? 2 : 4,
        mb: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
      }}
    >
      <Paper
        elevation={isMobile ? 1 : 3}
        sx={{ p: isMobile ? 2 : 3 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={isMobile ? 2 : 3}>
          <Typography variant={isMobile ? "h5" : "h4"}>
            Minha Agenda
          </Typography>

          <IconButton
            color="primary"
            onClick={() => setInvitesDrawerOpen(true)}
            aria-label="convites pendentes"
          >
            <Badge badgeContent={pendingInvitesCount} color="error">
              <MailIcon />
            </Badge>
          </IconButton>
        </Box>

        {initialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: isMobile ? 4 : 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <CalendarView
            events={events}
            onDateSelect={handleDateSelect}
            onEventClick={handleEventClick}
            onDatesSet={(info) => loadEvents(info.start, info.end)}
            currentUserId={user?.id}
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

      <Drawer
        anchor="right"
        open={invitesDrawerOpen}
        onClose={() => setInvitesDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : 400,
          },
        }}
      >
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Convites Pendentes</Typography>
          <IconButton onClick={() => setInvitesDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <PendingInvites onInviteResponded={handleInviteResponded} />
      </Drawer>

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
