import { PopulatedTeamMember, TeamInvitationWithTeamUserInfo, TeamJoinRequestWithTeamUserInfo } from '@/models';

export const teamMembers: PopulatedTeamMember[] = [
  {
    _id: "689281ff9e5253afde54cbc9",
    teamId: "6883cb686bcaa9cfcfa69cb5",
    role: "coach",
    status: "active",
    joinedAt: new Date("2025-01-15T10:30:00.000Z"),
    createdAt: new Date("2025-01-15T10:30:00.000Z"),
    updatedAt: new Date("2025-01-15T10:30:00.000Z"),
    userId: "5NlI0p6DoXQDnuOV0ddYTNcEb7M2",
    user: {
      _id: "6887c0aed02c1d83ce3f29a4",
      userId: "5NlI0p6DoXQDnuOV0ddYTNcEb7M2",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    _id: "6894007a5f705049d73af2f1",
    teamId: "6887ecd3f20b2ac66c32307c",
    role: "athlete",
    status: "active",
    programIds: ["prog_001", "prog_002"],
    joinedAt: new Date("2025-01-16T14:20:00.000Z"),
    createdAt: new Date("2025-01-16T14:20:00.000Z"),
    updatedAt: new Date("2025-01-16T14:20:00.000Z"),
    userId: "7KpJ2q8EoYRFeuPV1eeZUNdFc8N3",
    user: {
      _id: "6887c0aed02c1d83ce3f29a5",
      userId: "7KpJ2q8EoYRFeuPV1eeZUNdFc8N3",
      name: "Mike Rodriguez",
      email: "mike.rodriguez@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      position: "pitcher"
    }
  },
  {
    _id: "6894007a5f705049d73af2f2",
    teamId: "6887ecd3f20b2ac66c32307c",
    role: "athlete",
    status: "active",
    programIds: [],
    joinedAt: new Date("2025-01-17T09:15:00.000Z"),
    createdAt: new Date("2025-01-17T09:15:00.000Z"),
    updatedAt: new Date("2025-01-17T09:15:00.000Z"),
    userId: "9LqK3r9FpZSGfvQW2ffAUOeGd9O4",
    user: {
      _id: "6887c0aed02c1d83ce3f29a6",
      userId: "9LqK3r9FpZSGfvQW2ffAUOeGd9O4",
      name: "Emily Chen",
      email: "emily.chen@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      position: "catcher"
    }
  },
  {
    _id: "6894007a5f705049d73af2f3",
    teamId: "6887ecd3f20b2ac66c32307c",
    role: "athlete",
    status: "inactive", // Change from "pending" to "inactive"
    joinedAt: new Date("2025-01-18T16:45:00.000Z"),
    createdAt: new Date("2025-01-18T16:45:00.000Z"),
    updatedAt: new Date("2025-01-18T16:45:00.000Z"),
    userId: "1MrL4s0GqATHgwRX3ggBVPhHe0P5",
    user: {
      _id: "6887c0aed02c1d83ce3f29a7",
      userId: "1MrL4s0GqATHgwRX3ggBVPhHe0P5",
      name: "David Thompson",
      email: "david.thompson@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    _id: "6894007a5f705049d73af2f4",
    teamId: "6887ecd3f20b2ac66c32307c",
    role: "athlete",
    status: "active",
    programIds: ["prog_003"],
    joinedAt: new Date("2025-01-19T11:30:00.000Z"),
    createdAt: new Date("2025-01-19T11:30:00.000Z"),
    updatedAt: new Date("2025-01-19T11:30:00.000Z"),
    userId: "3NsM5t1HrBUIhySY4hhCWIiIf1Q6",
    user: {
      _id: "6887c0aed02c1d83ce3f29a8",
      userId: "3NsM5t1HrBUIhySY4hhCWIiIf1Q6",
      name: "Lisa Park",
      email: "lisa.park@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      position: "shortstop"
    }
  },
  {
    _id: "6894007a5f705049d73af2f5",
    teamId: "6887ecd3f20b2ac66c32307c",
    role: "coach", // Change from "admin" to "coach"
    status: "active",
    joinedAt: new Date("2025-01-20T13:20:00.000Z"),
    createdAt: new Date("2025-01-20T13:20:00.000Z"),
    updatedAt: new Date("2025-01-20T13:20:00.000Z"),
    userId: "5OtN6u2IsCVJizTZ5iiDXJjJg2R7",
    user: {
      _id: "6887c0aed02c1d83ce3f29a9",
      userId: "5OtN6u2IsCVJizTZ5iiDXJjJg2R7",
      name: "James Wilson",
      email: "james.wilson@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    _id: "6894007a5f705049d73af2f6",
    teamId: "6887ecd3f20b2ac66c32307c",
    role: "athlete",
    status: "inactive",
    joinedAt: new Date("2025-01-21T08:10:00.000Z"),
    createdAt: new Date("2025-01-21T08:10:00.000Z"),
    updatedAt: new Date("2025-01-21T08:10:00.000Z"),
    userId: "7PuO7v3JtDWKj0UA6jjEYKkKh3S8",
    user: {
      _id: "6887c0aed02c1d83ce3f29aa",
      userId: "7PuO7v3JtDWKj0UA6jjEYKkKh3S8",
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    _id: "6894007a5f705049d73af2f7",
    teamId: "6887ecd3f20b2ac66c32307c",
    role: "athlete",
    status: "active",
    joinedAt: new Date("2025-01-22T15:55:00.000Z"),
    createdAt: new Date("2025-01-22T15:55:00.000Z"),
    updatedAt: new Date("2025-01-22T15:55:00.000Z"),
    userId: "9QvP8w4KuEXLl1VB7kkFZLlLi4T9",
    user: {
      _id: "6887c0aed02c1d83ce3f29ab",
      userId: "9QvP8w4KuEXLl1VB7kkFZLlLi4T9",
      name: "Alex Kim",
      email: "alex.kim@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    _id: "6894007a5f705049d73af2f8",
    teamId: "6887ecd3f20b2ac66c32307c",
    role: "coach",
    status: "active",
    joinedAt: new Date("2025-01-23T12:40:00.000Z"),
    createdAt: new Date("2025-01-23T12:40:00.000Z"),
    updatedAt: new Date("2025-01-23T12:40:00.000Z"),
    userId: "1RwQ9x5LvFYMm2WC8llGAMmMj5U0",
    user: {
      _id: "6887c0aed02c1d83ce3f29ac",
      userId: "1RwQ9x5LvFYMm2WC8llGAMmMj5U0",
      name: "Rachel Brown",
      email: "rachel.brown@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    _id: "6894007a5f705049d73af2f9",
    teamId: "6887ecd3f20b2ac66c32307c",
    role: "athlete",
    status: "active",
    joinedAt: new Date("2025-01-24T10:25:00.000Z"),
    createdAt: new Date("2025-01-24T10:25:00.000Z"),
    updatedAt: new Date("2025-01-24T10:25:00.000Z"),
    userId: "3SxR0y6MwGZNn3XD9mmHBNnNk6V1",
    user: {
      _id: "6887c0aed02c1d83ce3f29ad",
      userId: "3SxR0y6MwGZNn3XD9mmHBNnNk6V1",
      name: "Chris Lee",
      email: "chris.lee@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face"
    }
  }
];



export const pendingRequests: TeamJoinRequestWithTeamUserInfo[] = [
  {
    _id: "req_001",
    teamId: "6887ecd3f20b2ac66c32307c",
    requestedBy: "user_coach_001",
    requestedAt: new Date("2025-01-20T09:15:00.000Z"),
    role: "coach",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    comment: null,
    createdAt: new Date("2025-01-20T09:15:00.000Z"),
    updatedAt: new Date("2025-01-20T09:15:00.000Z"),
    user: {
      userId: "user_coach_001",
      name: "Coach Michael Anderson",
      email: "michael.anderson@coaching.com",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "coach",
      isAdmin: false,
      currentOrganizationId: null,
      createdAt: null,
      experience: "15 years youth baseball coaching",
      certifications: "USA Baseball Level 2, First Aid Certified",
      philosophy: "Focus on fundamentals and character development"
    }
  },
  {
    _id: "req_002",
    teamId: "6887ecd3f20b2ac66c32307c",
    requestedBy: "user_coach_002",
    requestedAt: new Date("2025-01-21T14:30:00.000Z"),
    role: "coach",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    comment: null,
    createdAt: new Date("2025-01-21T14:30:00.000Z"),
    updatedAt: new Date("2025-01-21T14:30:00.000Z"),
    user: {
      userId: "user_coach_002",
      name: "Coach Sarah Williams",
      email: "sarah.williams@pitching.com",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      role: "coach",
      isAdmin: false,
      currentOrganizationId: null,
      createdAt: null,
      experience: "8 years coaching, former college pitcher",
      certifications: "NCAA Certified, Pitching Mechanics Specialist",
      philosophy: "Technical excellence with mental toughness"
    }
  },
  {
    _id: "req_003",
    teamId: "6887ecd3f20b2ac66c32307c",
    requestedBy: "user_athlete_001",
    requestedAt: new Date("2025-01-22T11:45:00.000Z"),
    role: "athlete",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    comment: null,
    createdAt: new Date("2025-01-22T11:45:00.000Z"),
    updatedAt: new Date("2025-01-22T11:45:00.000Z"),
    user: {
      userId: "user_athlete_001",
      name: "Jake Martinez",
      email: "jake.martinez@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      role: "athlete",
      isAdmin: false,
      currentOrganizationId: null,
      createdAt: null,
      height: 72,
      weight: 165,
      gender: "male",
      dateOfBirth: new Date("2008-06-15"),
      throwHand: "right",
      batHand: "right",
      position: "pitcher"
    }
  },
  {
    _id: "req_004",
    teamId: "6887ecd3f20b2ac66c32307c",
    requestedBy: "user_athlete_002",
    requestedAt: new Date("2025-01-23T16:20:00.000Z"),
    role: "athlete",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    comment: null,
    createdAt: new Date("2025-01-23T16:20:00.000Z"),
    updatedAt: new Date("2025-01-23T16:20:00.000Z"),
    user: {
      userId: "user_athlete_002",
      name: "Emma Thompson",
      email: "emma.thompson@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      role: "athlete",
      isAdmin: false,
      currentOrganizationId: null,
      createdAt: null,
      height: 68,
      weight: 140,
      gender: "female",
      dateOfBirth: new Date("2007-09-22"),
      throwHand: "right",
      batHand: "left",
      position: "catcher"
    }
  },
  {
    _id: "req_005",
    teamId: "6887ecd3f20b2ac66c32307c",
    requestedBy: "user_athlete_003",
    requestedAt: new Date("2025-01-24T13:10:00.000Z"),
    role: "athlete",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    comment: null,
    createdAt: new Date("2025-01-24T13:10:00.000Z"),
    updatedAt: new Date("2025-01-24T13:10:00.000Z"),
    user: {
      userId: "user_athlete_003",
      name: "Carlos Rodriguez",
      email: "carlos.rodriguez@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      role: "athlete",
      isAdmin: false,
      currentOrganizationId: null,
      createdAt: null,
      height: 70,
      weight: 155,
      gender: "male",
      dateOfBirth: new Date("2008-03-10"),
      throwHand: "right",
      batHand: "right",
      position: "shortstop"
    }
  },
  {
    _id: "req_006",
    teamId: "6887ecd3f20b2ac66c32307c",
    requestedBy: "user_athlete_004",
    requestedAt: new Date("2025-01-25T10:05:00.000Z"),
    role: "athlete",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    comment: null,
    createdAt: new Date("2025-01-25T10:05:00.000Z"),
    updatedAt: new Date("2025-01-25T10:05:00.000Z"),
    user: {
      userId: "user_athlete_004",
      name: "Aisha Johnson",
      email: "aisha.johnson@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      role: "athlete",
      isAdmin: false,
      currentOrganizationId: null,
      createdAt: null,
      height: 66,
      weight: 130,
      gender: "female",
      dateOfBirth: new Date("2007-12-05"),
      throwHand: "right",
      batHand: "both",
      position: "center_field"
    }
  }
];

// ... existing code ...

export const teamInvitations: TeamInvitationWithTeamUserInfo[] = [
  {
    _id: "inv_001",
    teamId: "6887ecd3f20b2ac66c32307c",
    invitedEmail: "john.doe@newuser.com",
    role: "athlete",
    comment: "We saw your potential at the local tournament. Would love to have you join our team!",
    invitedBy: "5NlI0p6DoXQDnuOV0ddYTNcEb7M2", // Sarah Johnson's userId
    invitedAt: new Date("2025-01-20T10:00:00.000Z"),
    status: "pending",
    respondedAt: null,
    expiresAt: new Date("2025-02-20T10:00:00.000Z"),
    createdAt: new Date("2025-01-20T10:00:00.000Z"),
    updatedAt: new Date("2025-01-20T10:00:00.000Z"),
    // No invitedUserId or user - new user invitation
  },
  {
    _id: "inv_002",
    teamId: "6887ecd3f20b2ac66c32307c",
    invitedEmail: "coach.martinez@baseballacademy.com",
    role: "coach",
    comment: "Your coaching philosophy aligns perfectly with our team values. We'd be honored to have you join us.",
    invitedBy: "5NlI0p6DoXQDnuOV0ddYTNcEb7M2", // Sarah Johnson's userId
    invitedAt: new Date("2025-01-21T14:30:00.000Z"),
    status: "pending",
    respondedAt: null,
    expiresAt: new Date("2025-02-21T14:30:00.000Z"),
    createdAt: new Date("2025-01-21T14:30:00.000Z"),
    updatedAt: new Date("2025-01-21T14:30:00.000Z"),
    // No invitedUserId or user - new user invitation
  },
  {
    _id: "inv_003",
    teamId: "6887ecd3f20b2ac66c32307c",
    invitedUserId: "existing_user_001",
    invitedEmail: "alex.chen@email.com",
    role: "athlete",
    comment: "Your performance at the regional championship was impressive. We'd love to have you on our team!",
    invitedBy: "5NlI0p6DoXQDnuOV0ddYTNcEb7M2", // Sarah Johnson's userId
    invitedAt: new Date("2025-01-22T11:15:00.000Z"),
    status: "pending",
    respondedAt: null,
    expiresAt: new Date("2025-02-22T11:15:00.000Z"),
    createdAt: new Date("2025-01-22T11:15:00.000Z"),
    updatedAt: new Date("2025-01-22T11:15:00.000Z"),
    user: {
      name: "Alex Chen",
      email: "alex.chen@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    _id: "inv_004",
    teamId: "6887ecd3f20b2ac66c32307c",
    invitedUserId: "existing_user_002",
    invitedEmail: "sophia.garcia@email.com",
    role: "athlete",
    comment: "Your defensive skills at shortstop are exactly what we need. Please consider joining our team!",
    invitedBy: "5NlI0p6DoXQDnuOV0ddYTNcEb7M2", // Sarah Johnson's userId
    invitedAt: new Date("2025-01-23T16:45:00.000Z"),
    status: "pending",
    respondedAt: null,
    expiresAt: new Date("2025-02-23T16:45:00.000Z"),
    createdAt: new Date("2025-01-23T16:45:00.000Z"),
    updatedAt: new Date("2025-01-23T16:45:00.000Z"),
    user: {
      name: "Sophia Garcia",
      email: "sophia.garcia@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    _id: "inv_005",
    teamId: "6887ecd3f20b2ac66c32307c",
    invitedUserId: "existing_user_003",
    invitedEmail: "david.kim@email.com",
    role: "coach",
    comment: "Your experience with youth development programs would be invaluable to our team. We hope you'll join us!",
    invitedBy: "5NlI0p6DoXQDnuOV0ddYTNcEb7M2", // Sarah Johnson's userId
    invitedAt: new Date("2025-01-24T09:20:00.000Z"),
    status: "pending",
    respondedAt: null,
    expiresAt: new Date("2025-02-24T09:20:00.000Z"),
    createdAt: new Date("2025-01-24T09:20:00.000Z"),
    updatedAt: new Date("2025-01-24T09:20:00.000Z"),
    user: {
      name: "David Kim",
      email: "david.kim@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    }
  }
];

