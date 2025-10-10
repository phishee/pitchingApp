import { Event } from '@/models';
import { WorkoutAssignmentData } from './work-assignment-types';

export const generateEvents = (
  assignmentData: WorkoutAssignmentData,
  organizationId: string,
  teamId: string,
  currentUserId: string
): Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[] => {
  if (!assignmentData.selectedWorkout || assignmentData.scheduleConfig.daysOfWeek.length === 0) {
    return [];
  }

  const events: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  const { daysOfWeek, numberOfWeeks, startDate, defaultStartTime, defaultEndTime } = assignmentData.scheduleConfig;
  
  const startDateObj = new Date(startDate);
  const groupId = `workout-assignment-${Date.now()}`;

  for (let week = 0; week < numberOfWeeks; week++) {
    daysOfWeek.forEach((dayIndex, sequenceIndex) => {
      const eventDate = new Date(startDateObj);
      eventDate.setDate(startDateObj.getDate() + (week * 7) + (dayIndex - startDateObj.getDay()));

      const [startHour, startMinute] = defaultStartTime.split(':').map(Number);
      const [endHour, endMinute] = defaultEndTime.split(':').map(Number);

      const eventStartTime = new Date(eventDate);
      eventStartTime.setHours(startHour, startMinute, 0, 0);

      const eventEndTime = new Date(eventDate);
      eventEndTime.setHours(endHour, endMinute, 0, 0);

      const event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        groupId,
        type: 'workout',
        organizationId,
        teamId,
        title: `${assignmentData.selectedWorkout!.name} - Week ${week + 1}`,
        description: assignmentData.selectedWorkout!.description,
        startTime: eventStartTime,
        endTime: eventEndTime,
        participants: {
          athletes: assignmentData.selectedMembers.map(member => ({
            userId: ('user' in member && member.user?.userId) || member.userId,
            memberId: member._id
          })),
          coaches: [],
          required: assignmentData.selectedMembers.map(member => 
            ('user' in member && member.user?.userId) || member.userId
          ),
          optional: []
        },
        recurrence: {
          pattern: 'none',
          interval: 1
        },
        sourceAssignmentId: `workout-${assignmentData.selectedWorkout!.id}`,
        sequenceNumber: week * daysOfWeek.length + sequenceIndex + 1,
        totalInSequence: numberOfWeeks * daysOfWeek.length,
        status: 'scheduled',
        visibility: 'team_only',
        createdBy: { userId: currentUserId, memberId: 'creator-member-id' },
        details: {
          type: 'workout',
          workoutId: assignmentData.selectedWorkout!.id,
          sessionType: assignmentData.sessionType === 'coached' ? 'individual' : assignmentData.sessionType,
          // bookingInfo: {
          //   isBookingRequested: false,
          //   requestStatus: 'none'
          // },
          estimatedDuration: 120,
          equipment: [],
          notes: assignmentData.notes,
          ...(Object.keys(assignmentData.exercisePrescriptions).length > 0 && {
            exercisePrescriptions: Object.fromEntries(
              Object.entries(assignmentData.exercisePrescriptions).map(([exerciseId, prescription]) => [
                exerciseId,
                {
                  prescribedMetrics: prescription.prescribedMetrics,
                  notes: '',
                  isModified: prescription.isPrescribed
                }
              ])
            )
          })
        }
      };

      events.push(event);
    });
  }

  return events;
};

export const calculateTotalEvents = (scheduleConfig: WorkoutAssignmentData['scheduleConfig']): number => {
  return scheduleConfig.daysOfWeek.length * scheduleConfig.numberOfWeeks;
};

export const validateStep = (step: string, assignmentData: WorkoutAssignmentData): boolean => {
  switch (step) {
    case 'athletes':
      return assignmentData.selectedMembers.length > 0;
    case 'workout':
      return assignmentData.selectedWorkout !== null;
    case 'prescriptions':
      return assignmentData.selectedWorkout !== null; // Can proceed if workout is selected
    case 'schedule':
      return assignmentData.scheduleConfig.daysOfWeek.length > 0;
    case 'review':
      return true;
    default:
      return false;
  }
};

export const getTimePresets = () => ({
  morning: { start: '09:00', end: '11:00' },
  afternoon: { start: '14:00', end: '16:00' },
  evening: { start: '17:00', end: '19:00' }
});

export const getDaysOfWeek = () => ({
  short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
});

export const getWeekdayShortcuts = () => ({
  weekdays: [1, 2, 3, 4, 5], // Mon-Fri
  weekend: [0, 6], // Sun, Sat
  allDays: [0, 1, 2, 3, 4, 5, 6]
});
