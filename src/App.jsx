import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, isWithinInterval, parseISO, addDays, addWeeks, addMonths, isSameDay, isToday } from 'date-fns';
import EventDialog from './components/EventDialog';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Extract unique categories from events
    const uniqueCategories = Array.from(new Set(events.map(event => event.category).filter(Boolean)));
    setCategories(uniqueCategories);
  }, [events]);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setIsPanelOpen(true);
  };

  const handleDateSelect = (selectInfo) => {
    // Check for conflicts
    const hasConflict = checkForConflicts(selectInfo.start, selectInfo.end);
    if (hasConflict) {
      alert('There is a conflict with an existing event. Please choose a different time.');
      return;
    }

    setSelectedEvent({
      id: Date.now().toString(), // Generate a temporary ID
      title: '',
      description: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      color: '#3788d8'
    });
    setIsPanelOpen(true);
  };

  const generateRecurringEvents = (event) => {
    if (!event.recurring || event.recurring.frequency === 'none') {
      return [event];
    }

    const events = [];
    const startDate = parseISO(event.start);
    const endDate = event.recurring.endDate ? parseISO(event.recurring.endDate) : addMonths(startDate, 12);
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const eventStart = new Date(currentDate);
      const eventEnd = new Date(eventStart.getTime() + (parseISO(event.end) - parseISO(event.start)));

      if (event.recurring.frequency === 'daily') {
        events.push({
          ...event,
          id: `${event.id}_${format(eventStart, 'yyyyMMdd')}`,
          start: eventStart,
          end: eventEnd
        });
        currentDate = addDays(currentDate, event.recurring.interval);
      } else if (event.recurring.frequency === 'weekly') {
        if (event.recurring.daysOfWeek.includes(eventStart.getDay())) {
          events.push({
            ...event,
            id: `${event.id}_${format(eventStart, 'yyyyMMdd')}`,
            start: eventStart,
            end: eventEnd
          });
        }
        currentDate = addDays(currentDate, 1);
      } else if (event.recurring.frequency === 'monthly') {
        if (eventStart.getDate() === event.recurring.customPattern.dayOfMonth) {
          events.push({
            ...event,
            id: `${event.id}_${format(eventStart, 'yyyyMMdd')}`,
            start: eventStart,
            end: eventEnd
          });
        }
        currentDate = addDays(currentDate, 1);
      }
    }

    return events;
  };

  const handleEventDrop = (info) => {
    const droppedEvent = info.event;
    const originalEvent = events.find(e => e.id === droppedEvent.id.split('_')[0]);
    
    if (!originalEvent) {
      info.revert();
      return;
    }

    // If it's a recurring event, ask user if they want to update all instances
    if (originalEvent.recurring && originalEvent.recurring.frequency !== 'none') {
      const updateAll = window.confirm(
        'This is a recurring event. Do you want to update all future instances?'
      );

      if (updateAll) {
        // Update the original event's start time
        const timeDiff = droppedEvent.start - parseISO(originalEvent.start);
        const newStart = new Date(parseISO(originalEvent.start).getTime() + timeDiff);
        const newEnd = new Date(parseISO(originalEvent.end).getTime() + timeDiff);

        const updatedEvent = {
          ...originalEvent,
          start: newStart.toISOString(),
          end: newEnd.toISOString()
        };

        // Regenerate all recurring events
        const newEvents = events.filter(e => !e.id.startsWith(originalEvent.id + '_'));
        const recurringEvents = generateRecurringEvents(updatedEvent);
        setEvents([...newEvents, ...recurringEvents]);
      } else {
        // Update only this instance
        const newEvent = {
          ...originalEvent,
          id: droppedEvent.id,
          start: droppedEvent.start.toISOString(),
          end: droppedEvent.end.toISOString()
        };
        setEvents(prevEvents => [...prevEvents, newEvent]);
      }
    } else {
      // Handle non-recurring event
      const hasConflict = checkForConflicts(droppedEvent.start, droppedEvent.end);
      if (hasConflict) {
        alert('Cannot move event: There is a conflict with an existing event.');
        info.revert();
        return;
      }

      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === droppedEvent.id
            ? { ...event, start: droppedEvent.start.toISOString(), end: droppedEvent.end.toISOString() }
            : event
        )
      );
    }
  };

  const checkForConflicts = (start, end) => {
    return events.some(event => {
      if (event.id === selectedEvent?.id) return false;
      const eventStart = parseISO(event.start);
      const eventEnd = parseISO(event.end);
      return (
        isWithinInterval(start, { start: eventStart, end: eventEnd }) ||
        isWithinInterval(end, { start: eventStart, end: eventEnd }) ||
        isWithinInterval(eventStart, { start, end })
      );
    });
  };

  const handleSaveEvent = (updatedEvent) => {
    // Ensure the event has all required fields and proper formatting
    const eventToSave = {
      ...updatedEvent,
      id: updatedEvent.id || Date.now().toString(),
      start: new Date(updatedEvent.start).toISOString(),
      end: new Date(updatedEvent.end).toISOString(),
      recurring: {
        ...updatedEvent.recurring,
        endDate: updatedEvent.recurring.endDate ? new Date(updatedEvent.recurring.endDate).toISOString() : null
      }
    };
    setSelectedEvent(eventToSave);
  };

  const handleSaveConfirm = () => {
    if (!selectedEvent) return;

    // Check for conflicts before saving
    const hasConflict = checkForConflicts(
      new Date(selectedEvent.start),
      new Date(selectedEvent.end)
    );

    if (hasConflict) {
      alert('Cannot save event: There is a conflict with an existing event.');
      return;
    }

    try {
      if (selectedEvent.id) {
        // Update existing event
        const newEvents = events.filter(event => !event.id.startsWith(selectedEvent.id + '_'));
        const recurringEvents = generateRecurringEvents(selectedEvent);
        setEvents([...newEvents, ...recurringEvents]);
      } else {
        // Add new event
        const recurringEvents = generateRecurringEvents(selectedEvent);
        setEvents(prevEvents => [...prevEvents, ...recurringEvents]);
      }
      setIsPanelOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('There was an error saving the event. Please try again.');
    }
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    // If it's a recurring event, ask user if they want to delete all instances
    if (selectedEvent.recurring && selectedEvent.recurring.frequency !== 'none') {
      const deleteAll = window.confirm(
        'This is a recurring event. Do you want to delete all instances of this event?'
      );

      if (deleteAll) {
        // Delete all instances of the recurring event
        setEvents(prevEvents => 
          prevEvents.filter(event => !event.id.startsWith(selectedEvent.id + '_'))
        );
      } else {
        // Delete only this instance
        setEvents(prevEvents => 
          prevEvents.filter(event => event.id !== selectedEvent.id)
        );
      }
    } else {
      // Delete regular event
      setEvents(prevEvents => 
        prevEvents.filter(event => event.id !== selectedEvent.id)
      );
    }
    setIsPanelOpen(false);
    setSelectedEvent(null);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Main Calendar Section */}
        <div className={`flex-1 p-4 transition-all duration-300 ${isPanelOpen ? 'mr-96' : ''}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Dynamic Event Calendar</h1>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Search events..."
                  className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                events={filteredEvents}
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                height="auto"
                dayCellClassNames="calendar-day"
                dayHeaderClassNames="calendar-header"
                nowIndicator={true}
                dayCellDidMount={(info) => {
                  if (isToday(info.date)) {
                    info.el.classList.add('today');
                  }
                }}
                dayHeaderDidMount={(info) => {
                  if (info.date.getDay() === 0 || info.date.getDay() === 6) {
                    info.el.classList.add('weekend');
                  }
                }}
                views={{
                  dayGridMonth: {
                    titleFormat: { year: 'numeric', month: 'long' },
                    dayHeaderFormat: { weekday: 'short' },
                    dayMaxEventRows: 3,
                    fixedWeekCount: false,
                    showNonCurrentDates: true,
                    dayCellClassNames: 'calendar-day',
                    dayHeaderClassNames: 'calendar-header'
                  }
                }}
                buttonText={{
                  today: 'Today',
                  month: 'Month',
                  week: 'Week',
                  day: 'Day'
                }}
                navLinks={true}
                businessHours={{
                  daysOfWeek: [1, 2, 3, 4, 5],
                  startTime: '09:00',
                  endTime: '17:00'
                }}
              />
            </div>
          </div>
        </div>

        {/* Event Editor Panel */}
        {isPanelOpen && (
          <EventDialog
            event={selectedEvent}
            onClose={() => setIsPanelOpen(false)}
            onSave={handleSaveEvent}
            onSaveConfirm={handleSaveConfirm}
            onDelete={handleDeleteEvent}
          />
        )}
      </div>
    </div>
  );
}

export default App; 