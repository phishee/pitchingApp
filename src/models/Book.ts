import { UserInfo } from "./User";

export interface BookingDetails {
    // Request metadata
    requestedAt: Date;
    requestedBy: UserInfo;  // Should match event athlete
    
    // Coach information
    requestedCoach: UserInfo;  // Specific coach or null for "any available"
    assignedCoach?: UserInfo;  // Set when approved (may differ from requested)
    
    // Status tracking
    status: BookingStatus;
    statusHistory: BookingStatusChange[];
    
    // Communication
    athleteMessage?: string;  // Optional message when requesting
    coachResponse?: string;   // Optional message when approving/rejecting
    
    // Scheduling
    originalEventTime: Date;  // Preserve original time in case of reschedule
    isRescheduled: boolean;
    
    // Cancellation
    cancelledAt?: Date;
    cancelledBy?: UserInfo;
    cancellationReason?: string;
  }
  
  export type BookingStatus = 
    | 'pending'      // Awaiting coach response
    | 'approved'     // Coach confirmed
    | 'rejected'     // Coach declined
    | 'cancelled';   // Athlete or coach cancelled after approval
  
  export interface BookingStatusChange {
    status: BookingStatus;
    changedAt: Date;
    changedBy: UserInfo;
    reason?: string;
  }