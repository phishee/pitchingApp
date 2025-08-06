export interface Organization {
  _id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  logoUrl: string;
  isOfficial?: boolean;
  type: 'school' | 'club' | 'academy' | 'other';
}