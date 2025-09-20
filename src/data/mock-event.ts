import { CalendarEvent } from '../models';

export const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    clientName: 'Jenny Wilson',
    service: 'Hair color',
    time: '14:00 - 16:00',
    color: 'purple',
    date: '2025-09-01',
    startTime: '14:00',
    endTime: '16:00'
  },
  {
    id: '2',
    clientName: 'Arlene McCoy',
    service: 'Fitness & Screen Care',
    time: '14:00 - 16:00',
    color: 'green',
    date: '2025-09-13',
    startTime: '14:00',
    endTime: '16:00'
  },
  {
    id: '3',
    clientName: 'Jane Cooper',
    service: 'Styling',
    time: '14:00 - 16:00',
    color: 'purple',
    date: '2025-09-10',
    startTime: '14:00',
    endTime: '16:00'
  },
  {
    id: '4',
    clientName: 'Wade Warren',
    service: 'Hair Cut',
    time: '14:00 - 16:00',
    color: 'green',
    date: '2025-09-15',
    startTime: '14:00',
    endTime: '16:00'
  },
  {
    id: '5',
    clientName: 'Cody Fisher',
    service: 'Hair color',
    time: '14:00 - 16:00',
    color: 'purple',
    date: '2025-09-18',
    startTime: '14:00',
    endTime: '16:00'
  },
  {
    id: '6',
    clientName: 'Cayla Brister',
    service: 'Hair cut',
    time: '16:30 - 18:00',
    color: 'purple',
    date: '2025-09-18',
    startTime: '16:30',
    endTime: '18:00'
  },
  {
    id: '7',
    clientName: 'Devon Lane',
    service: 'Dental Treatment',
    time: '14:00 - 16:00',
    color: 'green',
    date: '2025-09-27',
    startTime: '14:00',
    endTime: '16:00'
  },
  {
    id: '8',
    clientName: 'Dianne Russell',
    service: 'Barbering',
    time: '14:00 - 16:00',
    color: 'purple',
    date: '2025-09-31',
    startTime: '14:00',
    endTime: '16:00'
  },
  // Add more events for current day
  {
    id: '9',
    clientName: 'Sarah Johnson',
    service: 'Massage Therapy',
    time: '09:00 - 10:30',
    color: 'blue',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:30'
  },
  {
    id: '10',
    clientName: 'Mike Chen',
    service: 'Personal Training',
    time: '11:00 - 12:00',
    color: 'orange',
    date: new Date().toISOString().split('T')[0],
    startTime: '11:00',
    endTime: '12:00'
  },
  {
    id: '11',
    clientName: 'Lisa Rodriguez',
    service: 'Yoga Session',
    time: '13:00 - 14:00',
    color: 'green',
    date: new Date().toISOString().split('T')[0],
    startTime: '13:00',
    endTime: '14:00'
  }
];