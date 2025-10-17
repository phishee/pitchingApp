// src/app/api/lib/middleware/auth.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../firebase-admin';

// Interface for authenticated requests
export interface AuthenticatedRequest extends NextRequest {
  user: {
    uid: string;
    email?: string;
    name?: string;
    email_verified?: boolean;
    picture?: string;
  };
}

// Type for route handlers that require authentication
export type AuthenticatedHandler = (
  req: AuthenticatedRequest, 
  context?: any
) => Promise<NextResponse>;

/**
 * Middleware wrapper that adds Firebase authentication to API routes
 * @param handler - The route handler function that requires authentication
 * @returns Wrapped handler with authentication
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader) {
        return NextResponse.json(
          { error: 'Authorization header is required' }, 
          { status: 401 }
        );
      }

      if (!authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authorization header must start with "Bearer "' }, 
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      if (!token) {
        return NextResponse.json(
          { error: 'Token is required' }, 
          { status: 401 }
        );
      }

      // Verify the Firebase ID token
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      // Create authenticated request with user context
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        email_verified: decodedToken.email_verified,
        picture: decodedToken.picture,
      };

      // Call the original handler with authenticated request
      return handler(authenticatedReq, context);

    } catch (error: any) {
      console.error('Auth middleware error:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/id-token-expired') {
        return NextResponse.json(
          { error: 'Token has expired' }, 
          { status: 401 }
        );
      }
      
      if (error.code === 'auth/invalid-id-token') {
        return NextResponse.json(
          { error: 'Invalid token' }, 
          { status: 401 }
        );
      }

      // Generic error response
      return NextResponse.json(
        { error: 'Authentication failed' }, 
        { status: 401 }
      );
    }
  };
}

/**
 * Utility function to extract user ID from authenticated request
 * @param req - Authenticated request
 * @returns User ID
 */
export function getUserId(req: AuthenticatedRequest): string {
  return req.user.uid;
}

/**
 * Utility function to check if user is authenticated
 * @param req - Request object
 * @returns True if request is authenticated
 */
export function isAuthenticated(req: AuthenticatedRequest): boolean {
  return 'user' in req && req.user && 'uid' in req.user;
}
