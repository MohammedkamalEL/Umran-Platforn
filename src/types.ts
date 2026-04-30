export interface Movement {
  id: string;
  status: string;
  description: string;
  institutionName: string;
  timestamp: number;
  stage?: 'detected' | 'sorting' | 'processing' | 'verification' | 'resolution';
}

export interface Issue {
  id: string;
  trackingId: string;
  type: 'road' | 'water' | 'electricity' | 'waste' | 'other';
  interactionType: 'report' | 'suggestion' | 'inquiry';
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  regionId: string;
  severity: 1 | 2 | 3;
  status: 'pending' | 'verified' | 'in-progress' | 'completed' | 'resolved';
  currentStage: 'detected' | 'sorting' | 'processing' | 'verification' | 'resolution';
  mediaUrls: string[];
  voiceUrl?: string;
  reportCount: number;
  anonymous: boolean;
  reporterId?: string;
  assignedInstitution?: string;
  notes?: string;
  createdAt: any; // Using any for Firestore Timestamp compatibility
  updatedAt: any;
  expectedResolutionAt?: any;
  citizenSignOff?: boolean;
  reportedByCitizen?: boolean;
}

export interface Campaign {
  id: string;
  issueId: string;
  title: string;
  description: string;
  participantCount: number;
  progress: number; // 0 to 100
  status: 'planning' | 'active' | 'completed';
  regionId: string;
  pointsReward: number;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  creatorId: string;
  targetAmount?: number; // Financial goal in SDG
  currentAmount?: number; // Currently raised
  sponsorCount?: number;
}

export interface User {
  uid: string;
  role: 'citizen' | 'official' | 'partner';
  displayName: string;
  email?: string;
  photoURL?: string;
  preferredContactMethod?: 'email' | 'phone' | 'app';
  isAnonymous: boolean;
  points: number;
  regionId: string;
  achievements?: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: number;
  }[];
}

export interface Region {
  id: string;
  name: string;
  enName: string;
  capital: string;
  imageUrl: string;
  totalPoints: number;
  totalReports: number;
}

export interface Institution {
  id: string;
  name: string;
  fullName: string;
  website: string;
  type: 'infrastructure' | 'water' | 'electricity' | 'environment' | 'partner' | 'other';
  description: string;
  regionsServed?: string[];
}

export interface GovernmentAlert {
  id: string;
  institutionId: string;
  institutionName: string;
  title: string;
  message: string;
  type: 'weather' | 'infrastructure' | 'security' | 'health';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

export interface UtilityPayment {
  id: string;
  type: 'electricity' | 'water';
  amount: number;
  meterNumber: string;
  token?: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
}

export interface Participation {
  id: string;
  userId: string;
  campaignId: string;
  campaignTitle: string;
  campaignImage: string;
  type: 'join' | 'sponsor';
  amount?: number;
  pointsEarned: number;
  createdAt: number;
}
