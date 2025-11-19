import { useState, useEffect, useCallback, useRef } from 'react';
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
  Grid,
  Button,
} from '@mui/material';
import { Mail as MailIcon, Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import CalendarView from '../components/Calendar/CalendarView';
import CalendarSidebar from '../components/Calendar/CalendarSidebar';
import EventModal from '../components/Calendar/EventModal';
import PendingInvites from '../components/Calendar/PendingInvites';
import { eventsApi } from '../services/events.api';
import type { Event, CreateEventData, UpdateEventData } from '../types/event';
import { useAuth } from '../contexts/AuthContext';

export default function Calendar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const calendarRef = useRef<any>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const handleEventChange = async (eventId: number, start: Date, end: Date) => {
    try {
      await eventsApi.update(eventId, {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      setSuccess('Evento atualizado!');
      loadEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar evento');
      loadEvents();
    }
  };

  const handleSidebarDateChange = (date: Date) => {
    setCurrentDate(date);
    // Navegar o calendário para a data selecionada
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (calendarApi) {
        calendarApi.gotoDate(date);
      }
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        mt: isMobile ? 2 : 4,
        mb: isMobile ? 2 : 4,
        px: isMobile ? 1 : 2,
        maxWidth: '100%',
      }}
    >
      <Grid container spacing={2}>
        {/* Sidebar Esquerda - Ocultar no mobile */}
        {!isMobile && (
          <Grid item xs={12} lg={2}>
            {initialLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <CalendarSidebar
                events={events}
                currentDate={currentDate}
                onDateChange={handleSidebarDateChange}
                onEventClick={handleEventClick}
              />
            )}
          </Grid>
        )}

        {/* Calendário Principal */}
        <Grid item xs={12} lg={isMobile ? 12 : 7.5}>
          <Paper
            elevation={isMobile ? 1 : 3}
            sx={{ p: isMobile ? 2 : 3 }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={isMobile ? 2 : 3}>
              <Typography variant={isMobile ? "h5" : "h4"}>
                Minha Agenda
              </Typography>

              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedEvent(null);
                    setSelectedDates(null);
                    setModalOpen(true);
                  }}
                  size={isMobile ? "small" : "medium"}
                >
                  Novo Evento
                </Button>

                {/* Badge de convites apenas no mobile */}
                {isMobile && (
                  <IconButton
                    color="primary"
                    onClick={() => setInvitesDrawerOpen(true)}
                    aria-label="convites pendentes"
                  >
                    <Badge badgeContent={pendingInvitesCount} color="error">
                      <MailIcon />
                    </Badge>
                  </IconButton>
                )}
              </Box>
            </Box>

            {initialLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: isMobile ? 4 : 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <CalendarView
                ref={calendarRef}
                events={events}
                onDateSelect={handleDateSelect}
                onEventClick={handleEventClick}
                onDatesSet={(info) => {
                  setCurrentDate(info.start);
                  loadEvents(info.start, info.end);
                }}
                onEventChange={handleEventChange}
                currentUserId={user?.id}
              />
            )}
          </Paper>

          {/* Próximos Eventos - Apenas no mobile */}
          {isMobile && !initialLoading && (
            <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" mb={2}>
                Próximos Eventos
              </Typography>
              {(() => {
                const now = new Date();
                const sevenDaysFromNow = new Date();
                sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

                const upcomingEvents = events
                  .filter((event) => {
                    const eventDate = new Date(event.startDate);
                    return eventDate >= now && eventDate <= sevenDaysFromNow;
                  })
                  .sort((a, b) => {
                    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                  })
                  .slice(0, 5);

                if (upcomingEvents.length === 0) {
                  return (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                      Nenhum evento próximo
                    </Typography>
                  );
                }

                return (
                  <Box>
                    {upcomingEvents.map((event) => {
                      const eventDate = new Date(event.startDate);
                      const today = new Date();
                      const tomorrow = new Date(today);
                      tomorrow.setDate(tomorrow.getDate() + 1);

                      const isSameDay = (date1: Date, date2: Date) => {
                        return (
                          date1.getDate() === date2.getDate() &&
                          date1.getMonth() === date2.getMonth() &&
                          date1.getFullYear() === date2.getFullYear()
                        );
                      };

                      let dayLabel = '';
                      if (isSameDay(eventDate, today)) {
                        dayLabel = 'Hoje';
                      } else if (isSameDay(eventDate, tomorrow)) {
                        dayLabel = 'Amanhã';
                      } else {
                        dayLabel = eventDate.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short'
                        });
                      }

                      const time = eventDate.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <Box
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          sx={{
                            p: 1.5,
                            mb: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: event.color,
                              flexShrink: 0,
                            }}
                          />
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={500}>
                              {event.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dayLabel} - {time}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })()}
            </Paper>
          )}
        </Grid>

        {/* Sidebar Direita - Convites Pendentes - Ocultar no mobile */}
        {!isMobile && (
          <Grid item xs={12} lg={2.5}>
            <Paper elevation={2} sx={{ p: 2, position: 'sticky', top: 16 }}>
              <Typography variant="h6" mb={2}>
                Convites Pendentes
              </Typography>
              {initialLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <PendingInvites onInviteResponded={handleInviteResponded} />
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

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
