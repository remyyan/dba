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
  // Physical attributes
  height?: string; // e.g., "6'2\""
  weight?: number; // in pounds
  age?: number;
  jerseyNumber?: number;
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

export async function getPlayer(playerId: string): Promise<Player | null> {
  try {
    const playerRef = doc(db, 'players', playerId);
    const snapshot = await getDoc(playerRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Player;
    }

    return null;
  } catch (error) {
    console.error('Error getting player:', error);
    throw error;
  }
}

export async function getPlayerGameHistory(playerId: string): Promise<any[]> {
  try {
    // First get the player to get their name
    const player = await getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Get all games and filter for this player's performances
    const gamesRef = collection(db, 'games');
    const snapshot = await getDocs(gamesRef);

    const playerGames: any[] = [];

    snapshot.docs.forEach(doc => {
      const game = doc.data() as Game;

      // Check team1Players
      const team1Performance = game.team1Players?.find(p => p.playerName === player.name);
      if (team1Performance) {
        playerGames.push({
          gameNumber: game.gameNumber,
          date: game.date,
          ...team1Performance,
          playerScore: calculatePlayerScore(team1Performance)
        });
      }

      // Check team2Players
      const team2Performance = game.team2Players?.find(p => p.playerName === player.name);
      if (team2Performance) {
        playerGames.push({
          gameNumber: game.gameNumber,
          date: game.date,
          ...team2Performance,
          playerScore: calculatePlayerScore(team2Performance)
        });
      }
    });

    // Sort by game number
    return playerGames.sort((a, b) => a.gameNumber - b.gameNumber);
  } catch (error) {
    console.error('Error getting player game history:', error);
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

// Trade Proposal Operations
export interface TradeProposal {
  id?: string;
  fromTeam: string;
  toTeam: string;
  fromPlayers: string[];
  toPlayers: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  proposedBy: string; // email of proposer
  proposedAt: Timestamp;
  respondedAt?: Timestamp;
  respondedBy?: string;
}

export async function createTradeProposal(proposal: Omit<TradeProposal, 'id' | 'proposedAt' | 'status'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'tradeProposals'), {
      ...proposal,
      status: 'pending',
      proposedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating trade proposal:', error);
    throw error;
  }
}

export async function getTradeProposals(teamName: string): Promise<TradeProposal[]> {
  try {
    const q = query(
      collection(db, 'tradeProposals'),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    const proposals: TradeProposal[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as TradeProposal;
      if (data.fromTeam === teamName || data.toTeam === teamName) {
        proposals.push({
          id: doc.id,
          ...data
        });
      }
    });

    return proposals.sort((a, b) => b.proposedAt.seconds - a.proposedAt.seconds);
  } catch (error) {
    console.error('Error fetching trade proposals:', error);
    return [];
  }
}

export async function respondToTradeProposal(
  proposalId: string,
  status: 'accepted' | 'rejected',
  respondedBy: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'tradeProposals', proposalId), {
      status,
      respondedAt: Timestamp.now(),
      respondedBy
    });
  } catch (error) {
    console.error('Error responding to trade proposal:', error);
    throw error;
  }
}

export async function cancelTradeProposal(proposalId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'tradeProposals', proposalId), {
      status: 'cancelled',
      respondedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error cancelling trade proposal:', error);
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

    // Create new player with provided data
    const newPlayerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'> = playerData;

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

    // If there are duplicates for the same gameNumber, pick the "best/latest" doc.
    const ranked = querySnapshot.docs
      .map((snap) => {
        const data = snap.data() as any;
        const createdSeconds = data?.createdAt?.seconds ?? 0;
        const updatedSeconds = data?.updatedAt?.seconds ?? createdSeconds ?? 0;
        const hasTeams = Boolean(data?.team1) && Boolean(data?.team2);
        const hasScores = typeof data?.team1Score === 'number' && typeof data?.team2Score === 'number';
        const hasPotg = Boolean(data?.playerOfTheGame?.playerName) && Boolean(data?.playerOfTheGame?.team);
        const hasPlayers = Array.isArray(data?.team1Players) && Array.isArray(data?.team2Players) &&
          (data.team1Players.length + data.team2Players.length) > 0;

        // Higher is better.
        const score =
          (hasPotg ? 1000 : 0) +
          (hasPlayers ? 200 : 0) +
          (hasTeams ? 100 : 0) +
          (hasScores ? 50 : 0) +
          updatedSeconds;

        return { snap, data, score };
      })
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    return {
      id: best.snap.id,
      ...best.data
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
  // Enhanced player scoring system with more sophisticated weighting
  const baseScore = player.points * 1.0;
  const reboundScore = player.rebounds * 1.2;
  const assistScore = player.assists * 1.5;
  const stealScore = player.steals * 3.0;
  const blockScore = player.blocks * 3.0;

  // Shooting efficiency bonuses/penalties
  const fgEfficiencyBonus = player.fgPercentage > 0.5 ? player.points * 0.3 :
                           player.fgPercentage < 0.35 ? player.points * -0.2 : 0;
  const threePointBonus = player.threePM * 0.5; // Extra credit for 3-pointers
  const ftEfficiencyBonus = player.ftPercentage > 0.8 ? player.ftm * 0.3 : 0;

  // Volume shooting penalty for poor efficiency
  const volumePenalty = player.fgPercentage < 0.35 && player.fga > 10 ? -5 : 0;

  // Minutes played factor (normalize to 40 minutes, but don't penalize too much for low minutes)
  const minutesFactor = Math.min(player.minutes / 35, 1.2); // Cap at 1.2x for overtime games
  const minimumMinutes = Math.max(player.minutes / 40, 0.3); // Minimum 30% credit even for low minutes
  const minutesMultiplier = Math.max(minutesFactor, minimumMinutes);

  // Double-double and triple-double bonuses
  const stats = [player.points, player.rebounds, player.assists, player.steals, player.blocks];
  const doubleDigitStats = stats.filter(stat => stat >= 10).length;
  const doubleDoubleBonus = doubleDigitStats >= 2 ? 5 : 0;
  const tripleDoubleBonus = doubleDigitStats >= 3 ? 15 : 0;

  // Clutch performance bonus (high efficiency with significant contribution)
  const clutchBonus = (player.points >= 15 && player.fgPercentage > 0.5) ? 3 : 0;

  const totalScore = (
    baseScore +
    reboundScore +
    assistScore +
    stealScore +
    blockScore +
    fgEfficiencyBonus +
    threePointBonus +
    ftEfficiencyBonus +
    volumePenalty +
    doubleDoubleBonus +
    tripleDoubleBonus +
    clutchBonus
  ) * minutesMultiplier;

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

function normalizePlayerName(name: string): string {
  return (name || '').trim().toLowerCase();
}

function roundTo(value: number, decimals: number): number {
  if (!Number.isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

type PlayerAgg = {
  gamesPlayed: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  minutes: number;
  fgm: number;
  fga: number;
  threePM: number;
  threePA: number;
  ftm: number;
  fta: number;
  efficiencySum: number;
  playerScoreSum: number;
};

/**
 * Recalculate every player's season averages from ALL games in `games/*`.
 * This is useful after imports or data fixes where player season averages got out of sync.
 */
export async function recalculatePlayerAveragesFromGames(): Promise<{
  playersTotal: number;
  playersUpdated: number;
  playersSkipped: number;
}> {
  try {
    const [players, games] = await Promise.all([getAllPlayers(), getAllGames()]);

    const aggs = new Map<string, PlayerAgg>();
    const getOrInit = (key: string): PlayerAgg => {
      const existing = aggs.get(key);
      if (existing) return existing;
      const fresh: PlayerAgg = {
        gamesPlayed: 0,
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        minutes: 0,
        fgm: 0,
        fga: 0,
        threePM: 0,
        threePA: 0,
        ftm: 0,
        fta: 0,
        efficiencySum: 0,
        playerScoreSum: 0
      };
      aggs.set(key, fresh);
      return fresh;
    };

    const recordPerformance = (perf: GamePlayer | undefined) => {
      if (!perf) return;
      const nameKey = `name:${normalizePlayerName(perf.playerName)}`;
      const idKey = perf.playerId ? `id:${perf.playerId}` : '';

      const efficiency = Number.isFinite(perf.efficiency) ? perf.efficiency : calculatePlayerEfficiency(perf);
      const playerScore = calculatePlayerScore(perf);

      const apply = (agg: PlayerAgg) => {
        agg.gamesPlayed += 1;
        agg.points += perf.points || 0;
        agg.rebounds += perf.rebounds || 0;
        agg.assists += perf.assists || 0;
        agg.steals += perf.steals || 0;
        agg.blocks += perf.blocks || 0;
        agg.minutes += perf.minutes || 0;
        agg.fgm += perf.fgm || 0;
        agg.fga += perf.fga || 0;
        agg.threePM += perf.threePM || 0;
        agg.threePA += perf.threePA || 0;
        agg.ftm += perf.ftm || 0;
        agg.fta += perf.fta || 0;
        agg.efficiencySum += efficiency;
        agg.playerScoreSum += playerScore;
      };

      // Always record by name, and also by id if present.
      apply(getOrInit(nameKey));
      if (idKey) apply(getOrInit(idKey));
    };

    for (const game of games) {
      for (const perf of game.team1Players || []) recordPerformance(perf);
      for (const perf of game.team2Players || []) recordPerformance(perf);
    }

    let playersUpdated = 0;
    let playersSkipped = 0;

    // Firestore batches are limited to 500 writes; keep margin.
    let batch = writeBatch(db);
    let batchWrites = 0;

    const commitBatchIfNeeded = async (force = false) => {
      if (batchWrites === 0) return;
      if (!force && batchWrites < 450) return;
      await batch.commit();
      batch = writeBatch(db);
      batchWrites = 0;
    };

    for (const player of players) {
      if (!player.id) {
        playersSkipped += 1;
        continue;
      }

      const keyById = `id:${player.id}`;
      const keyByName = `name:${normalizePlayerName(player.name)}`;
      const agg = aggs.get(keyById) || aggs.get(keyByName);

      const gp = agg?.gamesPlayed || 0;
      const avgDiv = gp > 0 ? gp : 1;

      const fgmTotal = agg?.fgm || 0;
      const fgaTotal = agg?.fga || 0;
      const threePMTotal = agg?.threePM || 0;
      const threePATotal = agg?.threePA || 0;
      const ftmTotal = agg?.ftm || 0;
      const ftaTotal = agg?.fta || 0;

      const updates: Partial<Player> = {
        gamesPlayed: gp,
        points: roundTo((agg?.points || 0) / avgDiv, 2),
        rebounds: roundTo((agg?.rebounds || 0) / avgDiv, 2),
        assists: roundTo((agg?.assists || 0) / avgDiv, 2),
        steals: roundTo((agg?.steals || 0) / avgDiv, 2),
        blocks: roundTo((agg?.blocks || 0) / avgDiv, 2),
        minutes: roundTo((agg?.minutes || 0) / avgDiv, 2),
        fgm: roundTo(fgmTotal / avgDiv, 2),
        fga: roundTo(fgaTotal / avgDiv, 2),
        fgPercentage: roundTo(fgaTotal > 0 ? fgmTotal / fgaTotal : 0, 3),
        threePM: roundTo(threePMTotal / avgDiv, 2),
        threePA: roundTo(threePATotal / avgDiv, 2),
        threePPercentage: roundTo(threePATotal > 0 ? threePMTotal / threePATotal : 0, 3),
        ftm: roundTo(ftmTotal / avgDiv, 2),
        fta: roundTo(ftaTotal / avgDiv, 2),
        ftPercentage: roundTo(ftaTotal > 0 ? ftmTotal / ftaTotal : 0, 3),
        efficiency: roundTo(gp > 0 ? (agg?.efficiencySum || 0) / gp : 0, 2),
        playerScore: roundTo(gp > 0 ? (agg?.playerScoreSum || 0) / gp : 0, 2),
        updatedAt: Timestamp.now()
      };

      batch.update(doc(db, 'players', player.id), updates);
      batchWrites += 1;
      playersUpdated += 1;

      await commitBatchIfNeeded(false);
    }

    await commitBatchIfNeeded(true);

    return {
      playersTotal: players.length,
      playersUpdated,
      playersSkipped
    };
  } catch (error) {
    console.error('Error recalculating player averages:', error);
    throw error;
  }
}
