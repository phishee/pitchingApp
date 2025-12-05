
import { NextRequest, NextResponse } from 'next/server';
import container from '@/app/api/lib/container';
import { TeamController } from '@/app/api/lib/controllers/team.controller';
import { withAuth } from '@/app/api/lib/middleware/auth.middleware';

import { TEAM_TYPES } from '@/app/api/lib/symbols/Symbols';

const teamController = container.get<TeamController>(TEAM_TYPES.TeamController);

export const GET = withAuth(async (req: NextRequest) => {
    return teamController.getUserTeams(req);
});
