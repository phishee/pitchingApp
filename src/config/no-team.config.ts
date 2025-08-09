// src/config/no-team.config.ts
export const NO_TEAM_CONFIG = {
    // Pages that should always be accessible regardless of team status
    EXCLUDED_PAGES: [
      '/app/settings',
      '/app/profile',
      '/app/onboarding',
      '/app/teams/create',
      '/app/teams/join',
      '/app/teams',
      '/app/notifications',
      '/app/help',
    ],
    
    // URL patterns that should be excluded
    EXCLUDED_PATTERNS: [
      '/app/settings/*',
      '/app/profile/*',
      '/app/onboarding/*',
      '/app/teams/*',
      '/app/notifications/*',
      '/app/help/*',
    ],
    
    // Whether admins should see everything
    SHOW_FOR_ADMINS: true,
  };