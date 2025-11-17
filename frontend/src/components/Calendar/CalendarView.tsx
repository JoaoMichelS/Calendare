import { Box, useTheme, useMediaQuery } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import type { Event } from '../../types/event';

interface CalendarViewProps {
  events: Event[];
  onDateSelect: (start: Date, end: Date) => void;
  onEventClick: (event: Event) => void;
  onDatesSet: (info: { start: Date; end: Date }) => void;
}

export default function CalendarView({
  events,
  onDateSelect,
  onEventClick,
  onDatesSet,
}: CalendarViewProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600px - 900px

  const calendarEvents = events.map((event) => ({
    id: event.id.toString(),
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    backgroundColor: event.color,
    borderColor: event.color,
    extendedProps: event,
  }));

  // Configurações responsivas
  const getHeaderToolbar = () => {
    if (isMobile) {
      return {
        start: 'title',
        center: '',
        end: '',
      };
    }
    if (isTablet) {
      return {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek',
      };
    }
    return {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    };
  };

  const getFooterToolbar = () => {
    if (isMobile) {
      return {
        start: 'prev,next',
        center: '',
        end: 'listWeek,dayGridMonth',
      };
    }
    return false;
  };

  const getInitialView = () => {
    if (isMobile) return 'listWeek';
    if (isTablet) return 'dayGridMonth';
    return 'timeGridWeek';
  };

  const getHeight = () => {
    if (isMobile) return 'auto';
    if (isTablet) return '600px';
    return '700px';
  };

  const getTitleFormat = () => {
    if (isMobile) {
      return { month: 'short', day: 'numeric' };
    }
    return undefined;
  };

  return (
    <Box
      sx={{
        minHeight: isMobile ? 'auto' : '600px',
        width: '100%',
        // Ocultar datas da lista no mobile
        ...(isMobile && {
          '& .fc-list-day-cushion': {
            display: 'none',
          },
          '& .fc-list-day': {
            backgroundColor: 'transparent',
          },
        }),
      }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={getHeaderToolbar()}
        footerToolbar={getFooterToolbar()}
        titleFormat={getTitleFormat()}
        initialView={getInitialView()}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={isMobile ? 2 : true}
        weekends={true}
        events={calendarEvents}
        select={(info) => {
          onDateSelect(info.start, info.end);
        }}
        eventClick={(info) => {
          onEventClick(info.event.extendedProps as Event);
        }}
        eventDrop={(info) => {
          console.log('Teste Drag and Drop:', info);
        }}
        datesSet={(info) => {
          onDatesSet({ start: info.start, end: info.end });
        }}
        height={getHeight()}
        locale="pt-br"
        firstDay={0}
        slotMinTime="06:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={true}
        nowIndicator={true}
        navLinks={!isMobile}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
        }}
      />
    </Box>
  );
}
