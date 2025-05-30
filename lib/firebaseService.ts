import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { Player, Team, GameData, GamePlayerStats } from './data';

// Collections
const PLAYERS_COLLECTION = 'players';
const TEAMS_COLLECTION = 'teams';
const GAMES_COLLECTION = 'games';
const MVP_VOTES_COLLECTION = 'mvpVotes';
const SETTINGS_COLLECTION = 'settings';

// Player operations
export const playersService = {
  async getAll(): Promise<Player[]> {
    try {
      const querySnapshot = await getDocs(collection(db, PLAYERS_COLLECTION));
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<Player, 'id'>;
        return { ...data, id: doc.id } as Player;
      });
    } catch (error) {
      console.error('Error fetching players:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Player | null> {
    try {
      const docRef = doc(db, PLAYERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<Player, 'id'>;
        return { ...data, id: docSnap.id } as Player;
      }
      return null;
    } catch (error) {
      console.error('Error fetching player:', error);
      return null;
    }
  },

  async create(player: Omit<Player, 'id'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, PLAYERS_COLLECTION), player);
      return docRef.id;
    } catch (error) {
      console.error('Error creating player:', error);
      return null;
    }
  },

  async update(id: string, updates: Partial<Player>): Promise<boolean> {
    try {
      const docRef = doc(db, PLAYERS_COLLECTION, id);
      await updateDoc(docRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating player:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, PLAYERS_COLLECTION, id));
      return true;
    } catch (error) {
      console.error('Error deleting player:', error);
      return false;
    }
  }
};

// Team operations
export const teamsService = {
  async getAll(): Promise<Team[]> {
    try {
      const querySnapshot = await getDocs(collection(db, TEAMS_COLLECTION));
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<Team, 'id'>;
        return { ...data, id: doc.id } as Team;
      });
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  },

  async update(id: string, updates: Partial<Team>): Promise<boolean> {
    try {
      const docRef = doc(db, TEAMS_COLLECTION, id);
      await updateDoc(docRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating team:', error);
      return false;
    }
  }
};

// Game operations
export const gamesService = {
  async getAll(): Promise<GameData[]> {
    try {
      const q = query(collection(db, GAMES_COLLECTION), orderBy('gameNumber', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<GameData, 'id'>;
        return { ...data, id: doc.id } as GameData;
      });
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  },

  async getById(id: string): Promise<GameData | null> {
    try {
      const docRef = doc(db, GAMES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<GameData, 'id'>;
        return { ...data, id: docSnap.id } as GameData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching game:', error);
      return null;
    }
  },

  async create(game: Omit<GameData, 'id'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, GAMES_COLLECTION), game);
      return docRef.id;
    } catch (error) {
      console.error('Error creating game:', error);
      return null;
    }
  },

  async update(id: string, updates: Partial<GameData>): Promise<boolean> {
    try {
      const docRef = doc(db, GAMES_COLLECTION, id);
      await updateDoc(docRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating game:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, GAMES_COLLECTION, id));
      return true;
    } catch (error) {
      console.error('Error deleting game:', error);
      return false;
    }
  }
};

// MVP Voting operations
export const mvpVotingService = {
  async vote(playerName: string, voterEmail: string): Promise<boolean> {
    try {
      // Check if user has already voted
      const q = query(
        collection(db, MVP_VOTES_COLLECTION),
        where('voterEmail', '==', voterEmail)
      );
      const existingVotes = await getDocs(q);

      if (!existingVotes.empty) {
        console.log('User has already voted');
        return false;
      }

      // Add the vote
      await addDoc(collection(db, MVP_VOTES_COLLECTION), {
        playerName,
        voterEmail,
        timestamp: new Date(),
        season: '2024'
      });

      return true;
    } catch (error) {
      console.error('Error casting vote:', error);
      return false;
    }
  },

  async getVoteCounts(): Promise<Record<string, number>> {
    try {
      const querySnapshot = await getDocs(collection(db, MVP_VOTES_COLLECTION));
      const votes: Record<string, number> = {};

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        votes[data.playerName] = (votes[data.playerName] || 0) + 1;
      });

      return votes;
    } catch (error) {
      console.error('Error fetching vote counts:', error);
      return {};
    }
  },

  async hasUserVoted(voterEmail: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, MVP_VOTES_COLLECTION),
        where('voterEmail', '==', voterEmail)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if user voted:', error);
      return false;
    }
  }
};

// Settings operations
export const settingsService = {
  async get(key: string): Promise<any> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, key);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data().value : null;
    } catch (error) {
      console.error('Error fetching setting:', error);
      return null;
    }
  },

  async set(key: string, value: any): Promise<boolean> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, key);
      await updateDoc(docRef, { value, updatedAt: new Date() });
      return true;
    } catch (error) {
      console.error('Error setting value:', error);
      return false;
    }
  }
};

// Initialize database with default data
export const initializeDatabase = async () => {
  try {
    // Check if data already exists
    const playersSnapshot = await getDocs(collection(db, PLAYERS_COLLECTION));
    if (!playersSnapshot.empty) {
      console.log('Database already initialized');
      return;
    }

    console.log('Initializing database with default data...');

    // Add default players, teams, and games here
    // This would be called once to set up the initial data

  } catch (error) {
    console.error('Error initializing database:', error);
  }
};
