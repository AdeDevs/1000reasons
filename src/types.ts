import { z } from 'zod';

export interface Reason {
  id: string;
  number: number;
  category: string;
  title: string;
  content: string;
  citation: string;
  readMoreLink?: string;
  status: 'approved' | 'pending' | 'rejected';
  submittedBy?: string;
  email?: string;
  anonymous?: boolean;
}

export interface AppState {
  isSiteUp: boolean;
  trafficCount: number;
}
