import { Event } from '@/models';

// Mock data for different team members using the new Event model
export const mockMemberEvents: Record<string, Event[]> = {
  'user1': [
    {
      id: '1',
      groupId: 'group_1',
      type: 'workout',
      organizationId: 'org-123',
      teamId: 'team-456',
      title: 'Pitching Practice',
      description: 'Individual pitching mechanics and technique session',
      startTime: new Date('2025-01-15T14:00:00'),
      endTime: new Date('2025-01-15T16:00:00'),
      location: 'Bullpen A',
      participants: {
        athletes: [{ userId: 'user1', memberId: 'member1' }],
        coaches: [{ userId: 'coach1', memberId: 'coach-member1' }],
        required: ['user1', 'coach1'],
        optional: []
      },
      recurrence: {
        pattern: 'none',
        interval: 1
      },
      detailsId: 'workout-assignment-1',
      sequenceNumber: 1,
      totalInSequence: 1,
      status: 'scheduled',
      visibility: 'team_only',
      createdBy: { userId: 'coach1', memberId: 'coach-member1' },
      createdAt: new Date('2025-01-01T10:00:00'),
      updatedAt: new Date('2025-01-01T10:00:00')
    },
    {
      id: '2',
      groupId: 'group_2',
      type: 'workout',
      organizationId: 'org-123',
      teamId: 'team-456',
      title: 'Strength Training',
      description: 'Upper body strength and conditioning',
      startTime: new Date('2025-01-16T10:00:00'),
      endTime: new Date('2025-01-16T11:30:00'),
      location: 'Weight Room',
      participants: {
        athletes: [{ userId: 'user1', memberId: 'member1' }],
        coaches: [],
        required: ['user1'],
        optional: []
      },
      recurrence: {
        pattern: 'none',
        interval: 1
      },
      sequenceNumber: 1,
      totalInSequence: 1,
      status: 'scheduled',
      visibility: 'team_only',
      createdBy: { userId: 'trainer1', memberId: 'trainer-member1' },
      createdAt: new Date('2025-01-01T10:00:00'),
      updatedAt: new Date('2025-01-01T10:00:00'),
      detailsId: 'workout-assignment-2'
    },
    {
      id: '3',
      groupId: 'group_3',
      type: 'assessment',
      organizationId: 'org-123',
      teamId: 'team-456',
      title: 'Bullpen Assessment',
      description: 'Evaluation of pitching mechanics and velocity',
      startTime: new Date('2025-01-17T16:00:00'),
      endTime: new Date('2025-01-17T17:30:00'),
      location: 'Bullpen B',
      participants: {
        athletes: [{ userId: 'user1', memberId: 'member1' }],
        coaches: [{ userId: 'coach1', memberId: 'coach-member1' }],
        required: ['user1', 'coach1'],
        optional: []
      },
      recurrence: {
        pattern: 'none',
        interval: 1
      },
      sequenceNumber: 1,
      totalInSequence: 1,
      status: 'scheduled',
      visibility: 'team_only',
      createdBy: { userId: 'coach1', memberId: 'coach-member1' },
      createdAt: new Date('2025-01-01T10:00:00'),
      updatedAt: new Date('2025-01-01T10:00:00'),
      detailsId: 'assessment-plan-1'
    }
  ],
  'user2': [
    {
      id: '4',
      groupId: 'group_4',
      type: 'workout',
      organizationId: 'org-123',
      teamId: 'team-456',
      title: 'Batting Practice',
      description: 'Hitting mechanics and timing work',
      startTime: new Date('2025-01-15T09:00:00'),
      endTime: new Date('2025-01-15T10:30:00'),
      location: 'Batting Cage 1',
      participants: {
        athletes: [{ userId: 'user2', memberId: 'member2' }],
        coaches: [{ userId: 'coach2', memberId: 'coach-member2' }],
        required: ['user2', 'coach2'],
        optional: []
      },
      recurrence: {
        pattern: 'none',
        interval: 1
      },
      sequenceNumber: 1,
      totalInSequence: 1,
      status: 'scheduled',
      visibility: 'team_only',
      createdBy: { userId: 'coach2', memberId: 'coach-member2' },
      createdAt: new Date('2025-01-01T10:00:00'),
      updatedAt: new Date('2025-01-01T10:00:00'),
      detailsId: 'workout-assignment-4'
    },
    {
      id: '5',
      groupId: 'group_5',
      type: 'workout',
      organizationId: 'org-123',
      teamId: 'team-456',
      title: 'Fielding Drills',
      description: 'Infield and outfield defensive work',
      startTime: new Date('2025-01-16T11:00:00'),
      endTime: new Date('2025-01-16T12:00:00'),
      location: 'Main Field',
      participants: {
        athletes: [{ userId: 'user2', memberId: 'member2' }],
        coaches: [],
        required: ['user2'],
        optional: []
      },
      recurrence: {
        pattern: 'none',
        interval: 1
      },
      sequenceNumber: 1,
      totalInSequence: 1,
      status: 'scheduled',
      visibility: 'team_only',
      createdBy: { userId: 'coach2', memberId: 'coach-member2' },
      createdAt: new Date('2025-01-01T10:00:00'),
      updatedAt: new Date('2025-01-01T10:00:00'),
      detailsId: 'workout-assignment-5'
    },
    {
      id: '6',
      groupId: 'group_6',
      type: 'workout',
      organizationId: 'org-123',
      teamId: 'team-456',
      title: 'Conditioning',
      description: 'Cardio and endurance training',
      startTime: new Date('2025-01-18T15:00:00'),
      endTime: new Date('2025-01-18T16:00:00'),
      location: 'Track',
      participants: {
        athletes: [{ userId: 'user2', memberId: 'member2' }],
        coaches: [],
        required: ['user2'],
        optional: []
      },
      recurrence: {
        pattern: 'none',
        interval: 1
      },
      sequenceNumber: 1,
      totalInSequence: 1,
      status: 'scheduled',
      visibility: 'team_only',
      createdBy: { userId: 'trainer2', memberId: 'trainer-member2' },
      createdAt: new Date('2025-01-01T10:00:00'),
      updatedAt: new Date('2025-01-01T10:00:00'),
      detailsId: 'workout-assignment-6'
    }
  ],
  'user3': [
    {
      id: '7',
      groupId: 'group_7',
      type: 'workout',
      organizationId: 'org-123',
      teamId: 'team-456',
      title: 'Catching Practice',
      description: 'Catcher-specific drills and blocking work',
      startTime: new Date('2025-01-15T13:00:00'),
      endTime: new Date('2025-01-15T14:30:00'),
      location: 'Bullpen A',
      participants: {
        athletes: [{ userId: 'user3', memberId: 'member3' }],
        coaches: [{ userId: 'coach3', memberId: 'coach-member3' }],
        required: ['user3', 'coach3'],
        optional: []
      },
      recurrence: {
        pattern: 'none',
        interval: 1
      },
      sequenceNumber: 1,
      totalInSequence: 1,
      status: 'scheduled',
      visibility: 'team_only',
      createdBy: { userId: 'coach3', memberId: 'coach-member3' },
      createdAt: new Date('2025-01-01T10:00:00'),
      updatedAt: new Date('2025-01-01T10:00:00'),
      detailsId: 'workout-assignment-7'
    },
    {
      id: '8',
      groupId: 'group_8',
      type: 'coaching_session',
      organizationId: 'org-123',
      teamId: 'team-456',
      title: 'Pitching Mechanics Review',
      description: 'Video analysis and mechanical adjustments',
      startTime: new Date('2025-01-17T10:30:00'),
      endTime: new Date('2025-01-17T12:00:00'),
      location: 'Video Room',
      participants: {
        athletes: [{ userId: 'user3', memberId: 'member3' }],
        coaches: [{ userId: 'coach3', memberId: 'coach-member3' }],
        required: ['user3', 'coach3'],
        optional: []
      },
      recurrence: {
        pattern: 'none',
        interval: 1
      },
      sequenceNumber: 1,
      totalInSequence: 1,
      status: 'scheduled',
      visibility: 'team_only',
      createdBy: { userId: 'coach3', memberId: 'coach-member3' },
      createdAt: new Date('2025-01-01T10:00:00'),
      updatedAt: new Date('2025-01-01T10:00:00'),
      detailsId: 'coaching-booking-3'
    }
  ]
};

// Default events for when no specific member is selected
export const defaultEvents: Event[] = [
  {
    id: 'default1',
    groupId: 'group_default1',
    type: 'coaching_session',
    organizationId: 'org-123',
    teamId: 'team-456',
    title: 'Team Meeting',
    description: 'Weekly strategy and game plan discussion',
    startTime: new Date(),
    endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    location: 'Conference Room',
    participants: {
      athletes: [],
      coaches: [{ userId: 'coach1', memberId: 'coach-member1' }],
      required: ['coach1'],
      optional: []
    },
    recurrence: {
      pattern: 'none',
      interval: 1
    },
    sequenceNumber: 1,
    totalInSequence: 1,
    status: 'scheduled',
    visibility: 'team_only',
    createdBy: { userId: 'coach1', memberId: 'coach-member1' },
    createdAt: new Date(),
    updatedAt: new Date(),
    detailsId: 'coaching-booking-4'
  },
  {
    id: 'default2',
    groupId: 'group_default2',
    type: 'workout',
    organizationId: 'org-123',
    teamId: 'team-456',
    title: 'Team Practice',
    description: 'Full team practice session',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    location: 'Main Field',
    participants: {
      athletes: [],
      coaches: [],
      required: [],
      optional: []
    },
    recurrence: {
      pattern: 'none',
      interval: 1
    },
    sequenceNumber: 1,
    totalInSequence: 1,
    status: 'scheduled',
    visibility: 'team_only',
    createdBy: { userId: 'coach1', memberId: 'coach-member1' },
    createdAt: new Date(),
    updatedAt: new Date(),
    detailsId: 'workout-assignment-default2'
  }
];
