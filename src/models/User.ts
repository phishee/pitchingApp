export interface User {
  userId: string;
  name: string;
  email: string;
  profileImageUrl?: string;
  role?: 'coach' | 'athlete' | null;
  isAdmin: boolean;
  currentOrganizationId: string | null;
  createdAt: Date | null;

  // Athlete specific fields
  height?: number;
  weight?: number;
  gender?: 'male' | 'female';
  dateOfBirth?: Date;
  throwHand?: 'left' | 'right';
  batHand?: 'left' | 'right' | 'both';
  position?: 'pitcher' | 'catcher' | 'first_base' | 'second_base' | 'third_base' | 'shortstop' | 'left_field' | 'center_field' | 'right_field';

  // Coach specific fields
  experience?: string;
  certifications?: string;
  philosophy?: string;
  phoneNumber?: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  profileImageUrl: string;
}