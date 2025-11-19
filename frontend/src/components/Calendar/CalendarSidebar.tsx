import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import type { Event } from '../../types/event';

interface CalendarSidebarProps {
  events: Event[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: Event) => void;
}

export default function CalendarSidebar({
  events,
  currentDate,
  onDateChange,
  onEventClick,
}: CalendarSidebarProps) {
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());

  // Funções auxiliares para o mini calendário
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const hasEvents = (date: Date) => {
    return events.some((event) => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });
  };

  const handlePrevMonth = () => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setMiniCalendarDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setMiniCalendarDate(newDate);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(
      miniCalendarDate.getFullYear(),
      miniCalendarDate.getMonth(),
      day
    );
    onDateChange(clickedDate);
  };

  // Renderizar dias do calendário
  const renderMiniCalendar = () => {
    const daysInMonth = getDaysInMonth(miniCalendarDate);
    const firstDay = getFirstDayOfMonth(miniCalendarDate);
    const today = new Date();

    const days = [];
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    // Cabeçalho dos dias da semana
    const weekDayHeaders = weekDays.map((day, idx) => (
      <Box
        key={idx}
        sx={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'text.secondary',
        }}
      >
        {day}
      </Box>
    ));

    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ width: 32, height: 32 }} />);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        miniCalendarDate.getFullYear(),
        miniCalendarDate.getMonth(),
        day
      );
      const isToday = isSameDay(date, today);
      const isSelected = isSameDay(date, currentDate);
      const dayHasEvents = hasEvents(date);

      days.push(
        <Box
          key={day}
          onClick={() => handleDateClick(day)}
          sx={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            borderRadius: '50%',
            cursor: 'pointer',
            position: 'relative',
            bgcolor: isSelected ? 'primary.main' : 'transparent',
            color: isSelected
              ? 'primary.contrastText'
              : isToday
              ? 'primary.main'
              : 'text.primary',
            fontWeight: isToday || isSelected ? 600 : 400,
            '&:hover': {
              bgcolor: isSelected ? 'primary.dark' : 'action.hover',
            },
          }}
        >
          {day}
          {dayHasEvents && !isSelected && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 2,
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: 'primary.main',
              }}
            />
          )}
        </Box>
      );
    }

    return (
      <Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 32px)',
            gap: 0.5,
            justifyContent: 'center',
            mb: 1,
          }}
        >
          {weekDayHeaders}
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 32px)',
            gap: 0.5,
            justifyContent: 'center',
          }}
        >
          {days}
        </Box>
      </Box>
    );
  };

  // Filtrar eventos próximos (próximos 7 dias)
  const getUpcomingEvents = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return events
      .filter((event) => {
        const eventDate = new Date(event.startDate);
        return eventDate >= now && eventDate <= sevenDaysFromNow;
      })
      .sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 5);
  };

  const upcomingEvents = getUpcomingEvents();

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dayLabel = '';
    if (isSameDay(date, today)) {
      dayLabel = 'Hoje';
    } else if (isSameDay(date, tomorrow)) {
      dayLabel = 'Amanhã';
    } else {
      dayLabel = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      });
    }

    const time = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${dayLabel} - ${time}`;
  };

  return (
    <Stack spacing={2}>
      {/* Mini Calendário */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {miniCalendarDate.toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            })}
          </Typography>
          <Box>
            <Box
              component="button"
              onClick={handlePrevMonth}
              sx={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                p: 0.5,
                display: 'inline-flex',
                '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </Box>
            <Box
              component="button"
              onClick={handleNextMonth}
              sx={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                p: 0.5,
                display: 'inline-flex',
                '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </Box>
          </Box>
        </Box>

        {renderMiniCalendar()}
      </Paper>

      {/* Eventos Próximos */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={2}>
          Próximos Eventos
        </Typography>

        {upcomingEvents.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            Nenhum evento próximo
          </Typography>
        ) : (
          <List disablePadding>
            {upcomingEvents.map((event, index) => (
              <Box key={event.id}>
                {index > 0 && <Divider sx={{ my: 1 }} />}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => onEventClick(event)}
                    sx={{ px: 1, borderRadius: 1 }}
                  >
                    <CircleIcon
                      sx={{
                        fontSize: 12,
                        color: event.color,
                        mr: 1.5,
                      }}
                    />
                    <ListItemText
                      primary={event.title}
                      secondary={formatEventTime(event.startDate)}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 500,
                        noWrap: true,
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Stack>
  );
}
