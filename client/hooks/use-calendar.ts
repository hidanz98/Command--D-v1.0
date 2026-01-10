import { useState, useCallback } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  allDay?: boolean;
}

export interface CalendarState {
  isSupported: boolean;
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
}

export function useCalendar() {
  const [state, setState] = useState<CalendarState>({
    isSupported: true, // Suportado via links de calendário
    events: [],
    isLoading: false,
    error: null
  });

  // Gerar link do Google Calendar
  const generateGoogleCalendarUrl = useCallback((event: Omit<CalendarEvent, 'id'>): string => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`,
      details: event.description || '',
      location: event.location || '',
      sf: 'true',
      output: 'xml'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, []);

  // Gerar link do Apple Calendar (ICS)
  const generateICSFile = useCallback((event: Omit<CalendarEvent, 'id'>): string => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, -1) + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Bil's Cinema//NONSGML v1.0//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  }, []);

  // Adicionar evento ao calendário
  const addEvent = useCallback((event: Omit<CalendarEvent, 'id'>): string => {
    const id = `event_${Date.now()}`;
    const newEvent = { ...event, id };

    // Salvar localmente
    setState(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));

    // Salvar no localStorage
    const savedEvents = JSON.parse(localStorage.getItem('calendar_events') || '[]');
    savedEvents.push({
      ...newEvent,
      startDate: newEvent.startDate.toISOString(),
      endDate: newEvent.endDate.toISOString()
    });
    localStorage.setItem('calendar_events', JSON.stringify(savedEvents));

    return id;
  }, []);

  // Abrir no Google Calendar
  const openGoogleCalendar = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, '_blank');
  }, [generateGoogleCalendarUrl]);

  // Baixar arquivo ICS (funciona no iPhone)
  const downloadICS = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const url = generateICSFile(event);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generateICSFile]);

  // Carregar eventos salvos
  const loadEvents = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const savedEvents = JSON.parse(localStorage.getItem('calendar_events') || '[]');
      const events = savedEvents.map((e: any) => ({
        ...e,
        startDate: new Date(e.startDate),
        endDate: new Date(e.endDate)
      }));
      
      setState(prev => ({
        ...prev,
        events,
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  }, []);

  // Remover evento
  const removeEvent = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));

    const savedEvents = JSON.parse(localStorage.getItem('calendar_events') || '[]');
    const filtered = savedEvents.filter((e: any) => e.id !== id);
    localStorage.setItem('calendar_events', JSON.stringify(filtered));
  }, []);

  // Obter eventos de um dia específico
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    const targetDate = date.toDateString();
    return state.events.filter(event => {
      const eventDate = event.startDate.toDateString();
      return eventDate === targetDate;
    });
  }, [state.events]);

  // Criar evento de locação
  const createRentalEvent = useCallback((
    title: string,
    startDate: Date,
    endDate: Date,
    location?: string
  ) => {
    const event: Omit<CalendarEvent, 'id'> = {
      title: `🎬 ${title}`,
      description: `Locação de equipamento - Bil's Cinema e Vídeo`,
      startDate,
      endDate,
      location
    };

    addEvent(event);
    
    // Abrir no calendário apropriado
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      downloadICS(event);
    } else {
      openGoogleCalendar(event);
    }
  }, [addEvent, downloadICS, openGoogleCalendar]);

  return {
    ...state,
    addEvent,
    removeEvent,
    loadEvents,
    getEventsForDate,
    openGoogleCalendar,
    downloadICS,
    createRentalEvent,
    generateGoogleCalendarUrl,
    generateICSFile
  };
}

export default useCalendar;

