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
