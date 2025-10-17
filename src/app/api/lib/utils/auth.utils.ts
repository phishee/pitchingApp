// src/app/api/lib/utils/auth.utils.ts
import { NextRequest } from 'next/server';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * Type guard to check if a request is authenticated
 * @param req - Request object
 * @returns True if request is authenticated
 */
export function isAuthenticatedRequest(req: NextRequest): req is AuthenticatedRequest {
  return 'user' in req && req.user && typeof req.user === 'object' && 'uid' in req.user;
}

/**
 * Extract user information from authenticated request
 * @param req - Request object
 * @returns User information or null if not authenticated
 */
export function getUserFromRequest(req: NextRequest) {
  if (!isAuthenticatedRequest(req)) {
    return null;
  }
  
  return {
    uid: req.user.uid,
    email: req.user.email,
    name: req.user.name,
    email_verified: req.user.email_verified,
    picture: req.user.picture,
  };
}

/**
 * Extract user ID from authenticated request
 * @param req - Request object
 * @returns User ID or null if not authenticated
 */
export function getUserIdFromRequest(req: NextRequest): string | null {
  if (!isAuthenticatedRequest(req)) {
    return null;
  }
  
  return req.user.uid;
}

/**
 * Check if the authenticated user is accessing their own resource
 * @param req - Request object
 * @param resourceUserId - The user ID of the resource being accessed
 * @returns True if user is accessing their own resource
 */
export function isOwnResource(req: NextRequest, resourceUserId: string): boolean {
  const userId = getUserIdFromRequest(req);
  return userId === resourceUserId;
}
