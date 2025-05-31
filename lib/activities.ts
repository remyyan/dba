import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface Activity {
  id?: string;
  type: 'trade' | 'signing' | 'drop' | 'transfer';
  description: string;
  playerName: string;
  fromTeam?: string;
  toTeam?: string;
  timestamp: Timestamp;
  details?: string;
}

export async function addActivity(activity: Omit<Activity, 'id' | 'timestamp'>) {
  try {
    const docRef = await addDoc(collection(db, 'activities'), {
      ...activity,
      timestamp: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
}

export async function getRecentActivities(limitCount: number = 10): Promise<Activity[]> {
  try {
    const q = query(
      collection(db, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const activities: Activity[] = [];
    
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      } as Activity);
    });
    
    return activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

export function formatActivityDescription(activity: Activity): string {
  switch (activity.type) {
    case 'trade':
      return `${activity.playerName} traded from ${activity.fromTeam} to ${activity.toTeam}`;
    case 'signing':
      return `${activity.playerName} signed with ${activity.toTeam}`;
    case 'drop':
      return `${activity.playerName} dropped from ${activity.fromTeam}`;
    case 'transfer':
      return `${activity.playerName} transferred from ${activity.fromTeam} to ${activity.toTeam}`;
    default:
      return activity.description;
  }
}

export function getActivityIcon(type: Activity['type']): string {
  switch (type) {
    case 'trade':
      return '🔄';
    case 'signing':
      return '✍️';
    case 'drop':
      return '❌';
    case 'transfer':
      return '➡️';
    default:
      return '📝';
  }
}
