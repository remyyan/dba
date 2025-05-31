import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Data Types
export interface Player {
  id?: string;
  name: string;
  team: string;
  position?: string;
  // Season averages
  gamesPlayed: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  minutes: number;
  fgm: number;
  fga: number;
  fgPercentage: number;
  threePM: number;
  threePA: number;
  threePPercentage: number;
  ftm: number;
  fta: number;
  ftPercentage: number;
  // Calculated stats
  efficiency: number;
  playerScore: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Team {
  id?: string;
  name: string;
  wins: number;
  losses: number;
  winPercentage: number;
  pointsFor: number;
  pointsAgainst: number;
  playerIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GamePlayer {
  playerId: string;
  playerName: string;
  team: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  minutes: number;
  fgm: number;
  fga: number;
  fgPercentage: number;
  threePM: number;
  threePA: number;
  threePPercentage: number;
  ftm: number;
  fta: number;
  ftPercentage: number;
  efficiency: number;
}

export interface Game {
  id?: string;
  gameNumber: number;
  date: string;
  team1: string;
  team2: string;
  team1Score: number;
  team2Score: number;
  team1Players: GamePlayer[];
  team2Players: GamePlayer[];
  quarters?: {
    q1: { team1: number; team2: number };
    q2: { team1: number; team2: number };
    q3: { team1: number; team2: number };
    q4: { team1: number; team2: number };
  } | undefined;
  playerOfTheGame?: {
    playerId: string;
    playerName: string;
    team: string;
    score: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Player Operations
export async function createPlayer(playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'players'), {
      ...playerData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
}

export async function getAllPlayers(): Promise<Player[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'players'));
    const players: Player[] = [];

    querySnapshot.forEach((doc) => {
      players.push({
        id: doc.id,
        ...doc.data()
      } as Player);
    });

    return players.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

export async function getPlayersByTeam(teamName: string): Promise<Player[]> {
  try {
    const q = query(
      collection(db, 'players'),
      where('team', '==', teamName)
    );
    const querySnapshot = await getDocs(q);
    const players: Player[] = [];

    querySnapshot.forEach((doc) => {
      players.push({
        id: doc.id,
        ...doc.data()
      } as Player);
    });

    return players.sort((a, b) => b.points - a.points);
  } catch (error) {
    console.error('Error fetching team players:', error);
    return [];
  }
}

export async function updatePlayer(playerId: string, updates: Partial<Player>): Promise<void> {
  try {
    await updateDoc(doc(db, 'players', playerId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
}

export async function transferPlayer(playerName: string, fromTeam: string, toTeam: string): Promise<void> {
  try {
    // Find the player by name
    const players = await getAllPlayers();
    const player = players.find(p => p.name.toLowerCase() === playerName.toLowerCase());

    if (!player || !player.id) {
      throw new Error(`Player ${playerName} not found`);
    }

    // Update player's team
    await updatePlayer(player.id, { team: toTeam });
  } catch (error) {
    console.error('Error transferring player:', error);
    throw error;
  }
}

export async function addNewPlayer(playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Check if player already exists
    const existingPlayers = await getAllPlayers();
    const existingPlayer = existingPlayers.find(p =>
      p.name.toLowerCase() === playerData.name.toLowerCase()
    );

    if (existingPlayer) {
      // Update existing player's team
      if (existingPlayer.id) {
        await updatePlayer(existingPlayer.id, { team: playerData.team });
        return existingPlayer.id;
      }
    }

    // Create new player with default stats
    const newPlayerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'> = {
      name: playerData.name,
      team: playerData.team,
      gamesPlayed: 0,
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      minutes: 0,
      fgm: 0,
      fga: 0,
      fgPercentage: 0,
      threePM: 0,
      threePA: 0,
      threePPercentage: 0,
      ftm: 0,
      fta: 0,
      ftPercentage: 0,
      efficiency: 0,
      playerScore: 0,
      ...playerData
    };

    return await createPlayer(newPlayerData);
  } catch (error) {
    console.error('Error adding new player:', error);
    throw error;
  }
}

export async function cleanupQuarterPlayers(): Promise<void> {
  try {
    const players = await getAllPlayers();
    const quarterPlayers = players.filter(p =>
      p.name === 'Q1' || p.name === 'Q2' || p.name === 'Q3' || p.name === 'Q4'
    );

    for (const player of quarterPlayers) {
      if (player.id) {
        await deleteDoc(doc(db, 'players', player.id));
        console.log(`Removed quarter player: ${player.name}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up quarter players:', error);
    throw error;
  }
}

export async function cleanupDuplicateTeams(): Promise<void> {
  try {
    const teams = await getAllTeams();
    const teamNames = new Set<string>();
    const duplicates: Team[] = [];

    for (const team of teams) {
      if (teamNames.has(team.name)) {
        duplicates.push(team);
      } else {
        teamNames.add(team.name);
      }
    }

    for (const duplicate of duplicates) {
      if (duplicate.id) {
        await deleteDoc(doc(db, 'teams', duplicate.id));
        console.log(`Removed duplicate team: ${duplicate.name}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up duplicate teams:', error);
    throw error;
  }
}

// Team Operations
export async function createTeam(teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'teams'), {
      ...teamData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
}

export async function getAllTeams(): Promise<Team[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'teams'));
    const teams: Team[] = [];

    querySnapshot.forEach((doc) => {
      teams.push({
        id: doc.id,
        ...doc.data()
      } as Team);
    });

    return teams.sort((a, b) => b.winPercentage - a.winPercentage);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}

// Game Operations
export async function createGame(gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'games'), {
      ...gameData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
}

export async function getAllGames(): Promise<Game[]> {
  try {
    const q = query(
      collection(db, 'games'),
      orderBy('gameNumber', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const games: Game[] = [];

    querySnapshot.forEach((doc) => {
      games.push({
        id: doc.id,
        ...doc.data()
      } as Game);
    });

    return games;
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

export async function getGame(gameNumber: number): Promise<Game | null> {
  try {
    const q = query(
      collection(db, 'games'),
      where('gameNumber', '==', gameNumber)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Game;
  } catch (error) {
    console.error('Error fetching game:', error);
    return null;
  }
}

// Utility Functions
export function calculatePlayerEfficiency(player: GamePlayer): number {
  const efficiency = (
    player.points +
    player.rebounds +
    player.assists +
    player.steals +
    player.blocks
  ) - (
    (player.fga - player.fgm) +
    (player.fta - player.ftm)
  );

  return Math.max(0, efficiency);
}

export function calculatePlayerScore(player: GamePlayer): number {
  // Advanced player scoring system
  const baseScore = player.points * 1.0;
  const reboundScore = player.rebounds * 1.2;
  const assistScore = player.assists * 1.5;
  const stealScore = player.steals * 3.0;
  const blockScore = player.blocks * 3.0;
  const efficiencyBonus = player.fgPercentage > 0.5 ? player.points * 0.2 : 0;
  const minutesPlayed = Math.min(player.minutes / 40, 1); // Normalize to 40 minutes

  const totalScore = (
    baseScore +
    reboundScore +
    assistScore +
    stealScore +
    blockScore +
    efficiencyBonus
  ) * minutesPlayed;

  return Math.round(totalScore * 100) / 100;
}

export async function updateTeamRecords(): Promise<void> {
  try {
    // Get all games and teams
    const [games, teams] = await Promise.all([
      getAllGames(),
      getAllTeams()
    ]);

    // Calculate records for each team
    const teamStats: {[teamName: string]: {wins: number, losses: number, pointsFor: number, pointsAgainst: number}} = {};

    // Initialize team stats
    for (const team of teams) {
      teamStats[team.name] = {
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0
      };
    }

    // Process each game
    for (const game of games) {
      const team1 = game.team1;
      const team2 = game.team2;
      const team1Score = game.team1Score;
      const team2Score = game.team2Score;

      if (teamStats[team1] && teamStats[team2]) {
        // Add points
        teamStats[team1].pointsFor += team1Score;
        teamStats[team1].pointsAgainst += team2Score;
        teamStats[team2].pointsFor += team2Score;
        teamStats[team2].pointsAgainst += team1Score;

        // Determine winner
        if (team1Score > team2Score) {
          teamStats[team1].wins++;
          teamStats[team2].losses++;
        } else if (team2Score > team1Score) {
          teamStats[team2].wins++;
          teamStats[team1].losses++;
        }
      }
    }

    // Update each team in Firebase
    for (const team of teams) {
      if (team.id && teamStats[team.name]) {
        const stats = teamStats[team.name];
        const totalGames = stats.wins + stats.losses;
        const winPercentage = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

        await updateDoc(doc(db, 'teams', team.id), {
          wins: stats.wins,
          losses: stats.losses,
          winPercentage,
          pointsFor: stats.pointsFor,
          pointsAgainst: stats.pointsAgainst,
          updatedAt: Timestamp.now()
        });

        console.log(`Updated ${team.name}: ${stats.wins}-${stats.losses} (${winPercentage}%)`);
      }
    }
  } catch (error) {
    console.error('Error updating team records:', error);
    throw error;
  }
}
