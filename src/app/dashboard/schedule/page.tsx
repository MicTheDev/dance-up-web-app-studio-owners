'use client';

import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { Calendar, View, Event as RBCEvent } from 'react-big-calendar';
// @ts-ignore - react-big-calendar localizer types not fully available
import dateFnsLocalizer from 'react-big-calendar/lib/localizers/date-fns';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';

interface Class {
  id: string;
  name: string;
  day: string;
  time: string;
  duration: string;
  location: string;
  level: string;
  instructor: string;
  price?: number;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
}

interface Workshop {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  instructor: string;
  price?: number;
}

interface CalendarItem {
  id: string;
  type: 'class' | 'event' | 'workshop';
  title: string;
  time: string;
  location: string;
  data: Class | Event | Workshop;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'class' | 'event' | 'workshop';
    data: Class | Event | Workshop;
    location: string;
    time: string;
  };
}

// Configure the localizer for date-fns
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

export default function SchedulePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>('month');
  const [classes, setClasses] = useState<Class[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch classes
  useEffect(() => {
    if (!user) return;

    const classesRef = collection(db, 'classes');
    const q = query(classesRef, where('userId', '==', user.uid), where('isActive', '==', true));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const classesData: Class[] = [];
      querySnapshot.forEach((doc) => {
        classesData.push({ id: doc.id, ...doc.data() } as Class);
      });
      setClasses(classesData);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch events
  useEffect(() => {
    if (!user) return;

    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData: Event[] = [];
      querySnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() } as Event);
      });
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch workshops
  useEffect(() => {
    if (!user) return;

    const workshopsRef = collection(db, 'workshops');
    const q = query(workshopsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const workshopsData: Workshop[] = [];
      querySnapshot.forEach((doc) => {
        workshopsData.push({ id: doc.id, ...doc.data() } as Workshop);
      });
      setWorkshops(workshopsData);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Convert classes, events, and workshops into calendar events
  const calendarEvents = useMemo((): CalendarEvent[] => {
    const calendarEventList: CalendarEvent[] = [];

    // Helper function to parse time string (e.g., "14:30" or "2:30 PM") and get hours/minutes
    const parseTime = (timeStr: string): { hours: number; minutes: number } => {
      // Try 24-hour format first
      const time24Match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      if (time24Match) {
        return {
          hours: parseInt(time24Match[1]),
          minutes: parseInt(time24Match[2]),
        };
      }
      
      // Try 12-hour format
      const time12Match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (time12Match) {
        let hours = parseInt(time12Match[1]);
        const minutes = parseInt(time12Match[2]);
        const ampm = time12Match[3].toUpperCase();
        
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        return { hours, minutes };
      }
      
      return { hours: 0, minutes: 0 };
    };

    // Helper to parse duration (e.g., "1 hour", "90 minutes")
    const parseDuration = (durationStr: string): number => {
      const hourMatch = durationStr.match(/(\d+)\s*hour/i);
      if (hourMatch) {
        return parseInt(hourMatch[1]) * 60;
      }
      const minMatch = durationStr.match(/(\d+)\s*min/i);
      if (minMatch) {
        return parseInt(minMatch[1]);
      }
      return 60; // Default to 1 hour
    };

    // Convert events (one-time events with specific dates)
    events.forEach(event => {
      const eventDate = parse(event.date, 'yyyy-MM-dd', new Date());
      const time = parseTime(event.time);
      const start = new Date(eventDate);
      start.setHours(time.hours, time.minutes, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 60); // Default 1 hour for events

      calendarEventList.push({
        id: event.id,
        title: event.title,
        start,
        end,
        resource: {
          type: 'event',
          data: event,
          location: event.location,
          time: event.time,
        },
      });
    });

    // Convert workshops (one-time events with specific dates)
    workshops.forEach(workshop => {
      const workshopDate = parse(workshop.date, 'yyyy-MM-dd', new Date());
      const time = parseTime(workshop.time);
      const start = new Date(workshopDate);
      start.setHours(time.hours, time.minutes, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 120); // Default 2 hours for workshops

      calendarEventList.push({
        id: workshop.id,
        title: workshop.title,
        start,
        end,
        resource: {
          type: 'workshop',
          data: workshop,
          location: workshop.location,
          time: workshop.time,
        },
      });
    });

    // Convert classes (recurring weekly events)
    // Generate events for the next 12 weeks for monthly view
    const today = new Date();
    const weeksToShow = 12;
    
    classes.forEach(classItem => {
      const dayIndex = fullDayNames.indexOf(classItem.day);
      if (dayIndex === -1) return;

      const time = parseTime(classItem.time);
      const duration = parseDuration(classItem.duration || '1 hour');

      for (let week = 0; week < weeksToShow; week++) {
        const eventDate = new Date(today);
        eventDate.setDate(today.getDate() + (dayIndex - today.getDay() + week * 7));
        const start = new Date(eventDate);
        start.setHours(time.hours, time.minutes, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + duration);

        calendarEventList.push({
          id: `${classItem.id}-${week}`,
          title: classItem.name,
          start,
          end,
          resource: {
            type: 'class',
            data: classItem,
            location: classItem.location,
            time: classItem.time,
          },
        });
      }
    });

    return calendarEventList;
  }, [classes, events, workshops]);

  const handleEventClick = (event: RBCEvent) => {
    setSelectedEvent(event as CalendarEvent);
    setOpenDialog(true);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'class':
        return <SchoolIcon fontSize="small" />;
      case 'event':
        return <EventIcon fontSize="small" />;
      case 'workshop':
        return <MenuBookIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'primary';
      case 'event':
        return 'success';
      case 'workshop':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Event style getter for react-big-calendar
  const eventStyleGetter = (event: CalendarEvent) => {
    const colorMap: Record<string, string> = {
      class: '#8B5CF6', // vibrant purple
      event: '#EC4899', // vibrant pink
      workshop: '#F59E0B', // amber/orange
    };

    const bgColor = colorMap[event.resource.type] || '#8B5CF6';

    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
    };
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Schedule
        </Typography>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip icon={<SchoolIcon />} label="Classes" color="primary" size="small" />
        <Chip icon={<EventIcon />} label="Events" color="success" size="small" />
        <Chip icon={<MenuBookIcon />} label="Workshops" color="warning" size="small" />
      </Box>

      {/* Calendar */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleEventClick}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            eventPropGetter={eventStyleGetter}
            popup
            showMultiDayTimes
          />
        </Box>
      </Paper>

      {/* Event Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEvent?.start.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </DialogTitle>
        <DialogContent>
          {!selectedEvent ? (
            <Typography color="text.secondary">No event selected</Typography>
          ) : (
            <List>
              <ListItem>
                <ListItemIcon>
                  {getItemIcon(selectedEvent.resource.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {selectedEvent.title}
                      </Typography>
                      <Chip
                        label={selectedEvent.resource.type.charAt(0).toUpperCase() + selectedEvent.resource.type.slice(1)}
                        color={getItemColor(selectedEvent.resource.type) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <AccessTimeIcon fontSize="small" style={{ fontSize: 16 }} />
                        <Typography variant="body2" component="span">
                          {selectedEvent.resource.time} - {format(selectedEvent.end, 'h:mm a')}
                        </Typography>
                      </span>
                      <br />
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <LocationOnIcon fontSize="small" style={{ fontSize: 16 }} />
                        <Typography variant="body2" component="span">{selectedEvent.resource.location}</Typography>
                      </span>
                      {selectedEvent.resource.type === 'class' && (selectedEvent.resource.data as Class).instructor && (
                        <>
                          <br />
                          <Typography variant="body2" component="span">
                            Instructor: {(selectedEvent.resource.data as Class).instructor}
                          </Typography>
                        </>
                      )}
                      {selectedEvent.resource.type === 'workshop' && (selectedEvent.resource.data as Workshop).instructor && (
                        <>
                          <br />
                          <Typography variant="body2" component="span">
                            Instructor: {(selectedEvent.resource.data as Workshop).instructor}
                          </Typography>
                        </>
                      )}
                      {((selectedEvent.resource.type === 'class' && (selectedEvent.resource.data as Class).price) ||
                        (selectedEvent.resource.type === 'workshop' && (selectedEvent.resource.data as Workshop).price)) && (
                        <>
                          <br />
                          <Typography variant="body2" component="span" fontWeight="bold">
                            ${selectedEvent.resource.type === 'class' ? (selectedEvent.resource.data as Class).price : (selectedEvent.resource.data as Workshop).price}
                          </Typography>
                        </>
                      )}
                    </>
                  }
                />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

