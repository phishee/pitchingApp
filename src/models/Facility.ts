// Facility.ts

import { UserInfo } from "./User";

export interface Facility {
    _id: string;
    organizationId: string;
    name: string;
    type: 'field' | 'gym' | 'indoor_facility' | 'other';
    status: 'active' | 'inactive' | 'maintenance';

    description?: string;
    coverPhotoUrl?: string;
    
    // Location
    address?: string;
    
    // Simple capacity
    maxOccupancy?: number;
    
    // Basic features
    amenities?: string[]; // ["batting_cages", "bullpen", "weight_room"]
    
    // Simple availability
    isBookable: boolean;
    requiresApproval: boolean;

    public: boolean;

    
    // Metadata
    createdAt: Date;
    updatedAt: Date;
    createdBy: UserInfo;
  }
  
//   export interface FacilityBooking {
//     _id: string;
//     facilityId: string;
    
//     // Link to your existing Event system
//     eventId: string;
    
//     // Who booked it
//     teamId: string;
//     bookedBy: UserInfo; // Uses your existing UserInfo type
    
//     // When
//     startTime: Date;
//     endTime: Date;
    
//     // Status
//     status: 'confirmed' | 'pending' | 'cancelled';
    
//     createdAt: Date;
//   }