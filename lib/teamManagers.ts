import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  deleteDoc,
  doc,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface TeamManager {
  id?: string;
  email: string;
  teamName: string;
  assignedBy: string;
  assignedAt: Timestamp;
}

export async function assignTeamManager(email: string, teamName: string, assignedBy: string) {
  try {
    // Check if manager already exists for this team
    const q = query(
      collection(db, 'teamManagers'),
      where('teamName', '==', teamName)
    );
    const existingManagers = await getDocs(q);
    
    // Remove existing manager for this team
    for (const managerDoc of existingManagers.docs) {
      await deleteDoc(doc(db, 'teamManagers', managerDoc.id));
    }

    // Add new manager
    const docRef = await addDoc(collection(db, 'teamManagers'), {
      email,
      teamName,
      assignedBy,
      assignedAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error assigning team manager:', error);
    throw error;
  }
}

export async function removeTeamManager(teamName: string) {
  try {
    const q = query(
      collection(db, 'teamManagers'),
      where('teamName', '==', teamName)
    );
    const managers = await getDocs(q);
    
    for (const managerDoc of managers.docs) {
      await deleteDoc(doc(db, 'teamManagers', managerDoc.id));
    }
  } catch (error) {
    console.error('Error removing team manager:', error);
    throw error;
  }
}

export async function getAllTeamManagers(): Promise<TeamManager[]> {
  try {
    const q = query(collection(db, 'teamManagers'));
    const querySnapshot = await getDocs(q);
    const managers: TeamManager[] = [];
    
    querySnapshot.forEach((doc) => {
      managers.push({
        id: doc.id,
        ...doc.data()
      } as TeamManager);
    });
    
    return managers;
  } catch (error) {
    console.error('Error fetching team managers:', error);
    return [];
  }
}
