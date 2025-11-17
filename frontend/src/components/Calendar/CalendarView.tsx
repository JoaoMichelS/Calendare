import { Box } from '@mui/material';
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
  const calendarEvents = events.map((event) => ({
    id: event.id.toString(),
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    backgroundColor: event.color,
    borderColor: event.color,
    extendedProps: event,
  }));

  return (
    <Box sx={{ minHeight: '600px', width: '100%' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        initialView="timeGridWeek"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
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
        height="700px"
        locale="pt-br"
        firstDay={0}
        slotMinTime="06:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={true}
      />
    </Box>
  );
}
