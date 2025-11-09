export const DB_TYPES = {
    IDatabase: Symbol.for('IDatabase'),
    MongoDBProvider: Symbol.for('MongoDBProvider'),
    DBProviderFactory: Symbol.for('DBProviderFactory'),
  } as const;

export const USER_TYPES = {
    UserService: Symbol.for('UserService'),
    UserManager: Symbol.for('UserManager'),
    UserController: Symbol.for('UserController'),
  } as const;

export const TEAM_TYPES = {
    TeamService: Symbol.for('TeamService'),
    TeamManager: Symbol.for('TeamManager'),
    TeamController: Symbol.for('TeamController'),
  } as const;

export const ORGANIZATION_TYPES = {
    OrganizationService: Symbol.for('OrganizationService'),
    OrganizationManager: Symbol.for('OrganizationManager'),
    OrganizationController: Symbol.for('OrganizationController'),
  } as const;

export const TEAM_MEMBER_TYPES = {
    TeamMemberService: Symbol.for('TeamMemberService'),
    TeamMemberManager: Symbol.for('TeamMemberManager'),
    TeamMemberController: Symbol.for('TeamMemberController'),
  } as const;

export const TEAM_INVITATION_TYPES = {
    TeamInvitationService: Symbol.for('TeamInvitationService'),
    TeamInvitationManager: Symbol.for('TeamInvitationManager'),
    TeamInvitationController: Symbol.for('TeamInvitationController'),
  } as const;

export const TEAM_JOIN_REQUEST_TYPES = {
    TeamJoinRequestService: Symbol.for('TeamJoinRequestService'),
    TeamJoinRequestManager: Symbol.for('TeamJoinRequestManager'),
    TeamJoinRequestController: Symbol.for('TeamJoinRequestController'),
  } as const;

// Add Exercise Types
export const EXERCISE_TYPES = {
    ExerciseService: Symbol.for('ExerciseService'),
    ExerciseManager: Symbol.for('ExerciseManager'),
    ExerciseController: Symbol.for('ExerciseController'),
  } as const;

// Add workout symbols
export const WORKOUT_TYPES = {
  WorkoutService: Symbol.for('WorkoutService'),
  WorkoutManager: Symbol.for('WorkoutManager'),
  WorkoutController: Symbol.for('WorkoutController'),
} as const;

export const WORKOUT_SESSION_TYPES = {
  WorkoutSessionService: Symbol.for('WorkoutSessionService'),
  WorkoutSessionController: Symbol.for('WorkoutSessionController'),
} as const;

// Add event symbols
export const EVENT_TYPES = {
  EventService: Symbol.for('EventService'),
  EventManager: Symbol.for('EventManager'),
  EventController: Symbol.for('EventController'),
} as const;

// Add workout assignment symbols
export const WORKOUT_ASSIGNMENT_TYPES = {
  WorkoutAssignmentService: Symbol.for('WorkoutAssignmentService'),
  WorkoutAssignmentController: Symbol.for('WorkoutAssignmentController'),
} as const;

// Add event management symbols
export const EVENT_MANAGEMENT_TYPES = {
  EventManagementService: Symbol.for('EventManagementService'),
  EventGeneratorService: Symbol.for('EventGeneratorService'),
  RecurrenceCalculatorService: Symbol.for('RecurrenceCalculatorService'),
} as const;

// Add facility symbols
export const FACILITY_TYPES = {
  FacilityService: Symbol.for('FacilityService'),
  FacilityManager: Symbol.for('FacilityManager'),
  FacilityController: Symbol.for('FacilityController'),
} as const;
