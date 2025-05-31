export type PlayerPosition = 'G' | 'F' | 'C' | 'UTIL'; // Guard, Forward, Center, Utility

export interface Player {
  id?: string;
  name: string;
  team: string;
  position?: PlayerPosition;
  jerseyNumber?: number;
  height?: string;
  weight?: string;
  points: number;
  careerHigh: number;
  rebounds: number;
  assists: number;
  threePointersMade: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
  steals: number;
  blocks: number;
  minutes: number;
  freeThrowAttempts: number;
  mvpVotes?: number;
  isInjured?: boolean;
  injuryStatus?: string;
}

export interface TeamCaptain {
  userId: string;
  email: string;
  name: string;
  appointedDate: Date;
  permissions: TeamPermission[];
}

export type TeamPermission =
  | 'manage_roster'
  | 'propose_trades'
  | 'set_lineups'
  | 'manage_positions'
  | 'view_analytics'
  | 'manage_injuries';

export interface Team {
  id?: string;
  name: string;
  players: Player[];
  wins: number;
  losses: number;
  winPercentage: number;
  color: string;
  captains?: TeamCaptain[];
  teamMotto?: string;
  foundedDate?: Date;
}

export interface GameRecord {
  game: string;
  player: string;
  achievement: string;
  details: string;
}

export interface GameData {
  id?: string;
  gameNumber: number;
  date: string;
  team1Score: number;
  team2Score: number;
  team1Players: GamePlayerStats[];
  team2Players: GamePlayerStats[];
  status?: string;
  quarters?: {
    q1: { team1: number; team2: number };
    q2: { team1: number; team2: number };
    q3: { team1: number; team2: number };
    q4: { team1: number; team2: number };
  };
}

export interface GamePlayerStats {
  name: string;
  points: number;
  rebounds: number;
  assists: number;
  fgm: number;
  fga: number;
  fgPercentage: number;
  threePM: number;
  threePA: number;
  threePPercentage: number;
  ftm: number;
  fta: number;
  ftPercentage: number;
  steals: number;
  blocks: number;
  minutes: number;
}

export interface LeagueRecord {
  category: string;
  value: number | string;
  player: string;
  description: string;
}

export interface ActivityFeedItem {
  id: string;
  type: 'trade' | 'signing' | 'release' | 'game' | 'record' | 'mvp';
  title: string;
  description: string;
  timestamp: Date;
  players?: string[];
  teams?: string[];
  icon: string;
}

export interface FreeAgent {
  player: Player;
  releaseDate: Date;
  releasedBy: string;
  reason?: string;
}

// Raw data from CSV converted to structured format
const playersData: Player[] = [
  // Golden Dragons
  {
    name: "J. Bai",
    team: "Golden Dragons",
    position: "G",
    jerseyNumber: 1,
    height: "6'0\"",
    weight: "175 lbs",
    points: 41.3,
    careerHigh: 56,
    rebounds: 13,
    assists: 5.3,
    threePointersMade: 10.3,
    fieldGoalPercentage: 0.25,
    threePointPercentage: 0.21,
    freeThrowPercentage: 0.33,
    steals: 3.0,
    blocks: 2.3,
    minutes: 42.67,
    freeThrowAttempts: 1.0,
    mvpVotes: 0
  },
  {
    name: "R. Yan",
    team: "Golden Dragons",
    position: "C",
    jerseyNumber: 15,
    height: "6'8\"",
    weight: "220 lbs",
    points: 30.3,
    careerHigh: 33,
    rebounds: 27.3,
    assists: 8.3,
    threePointersMade: 3.0,
    fieldGoalPercentage: 0.51,
    threePointPercentage: 0.26,
    freeThrowPercentage: 0.57,
    steals: 2.3,
    blocks: 3.7,
    minutes: 42.67,
    freeThrowAttempts: 2.3,
    mvpVotes: 0
  },
  {
    name: "E. Josic",
    team: "Golden Dragons",
    points: 0,
    careerHigh: 0,
    rebounds: 0,
    assists: 0,
    threePointersMade: 0,
    fieldGoalPercentage: 0,
    threePointPercentage: 0,
    freeThrowPercentage: 0,
    steals: 0,
    blocks: 0,
    minutes: 0,
    freeThrowAttempts: 0,
    mvpVotes: 0
  },
  {
    name: "Z. Smith",
    team: "Golden Dragons",
    points: 0,
    careerHigh: 0,
    rebounds: 0,
    assists: 0,
    threePointersMade: 0,
    fieldGoalPercentage: 0,
    threePointPercentage: 0,
    freeThrowPercentage: 0,
    steals: 0,
    blocks: 0,
    minutes: 0,
    freeThrowAttempts: 0,
    mvpVotes: 0
  },
  {
    name: "C. Yang",
    team: "Golden Dragons",
    points: 0,
    careerHigh: 0,
    rebounds: 0,
    assists: 0,
    threePointersMade: 0,
    fieldGoalPercentage: 0,
    threePointPercentage: 0,
    freeThrowPercentage: 0,
    steals: 0,
    blocks: 0,
    minutes: 0,
    freeThrowAttempts: 0,
    mvpVotes: 0
  },
  // Los Sigmas
  {
    name: "A. Guo",
    team: "Los Sigmas",
    position: "F",
    jerseyNumber: 23,
    height: "6'6\"",
    weight: "210 lbs",
    points: 75.7,
    careerHigh: 100,
    rebounds: 30,
    assists: 2,
    threePointersMade: 2,
    fieldGoalPercentage: 0.52,
    threePointPercentage: 0.46,
    freeThrowPercentage: 0.52,
    steals: 1.0,
    blocks: 3.0,
    minutes: 42.67,
    freeThrowAttempts: 14.7,
    mvpVotes: 0
  },
  {
    name: "M. Josic",
    team: "Los Sigmas",
    points: 0,
    careerHigh: 0,
    rebounds: 0,
    assists: 0,
    threePointersMade: 0,
    fieldGoalPercentage: 0,
    threePointPercentage: 0,
    freeThrowPercentage: 0,
    steals: 0,
    blocks: 0,
    minutes: 0,
    freeThrowAttempts: 0,
    mvpVotes: 0
  },
  {
    name: "A. Luo",
    team: "Los Sigmas",
    points: 0,
    careerHigh: 0,
    rebounds: 0,
    assists: 0,
    threePointersMade: 0,
    fieldGoalPercentage: 0,
    threePointPercentage: 0,
    freeThrowPercentage: 0,
    steals: 0,
    blocks: 0,
    minutes: 0,
    freeThrowAttempts: 0,
    mvpVotes: 0
  },
  {
    name: "N. Ho",
    team: "Los Sigmas",
    position: "G",
    jerseyNumber: 7,
    height: "5'10\"",
    weight: "165 lbs",
    points: 30,
    careerHigh: 30,
    rebounds: 15,
    assists: 4,
    threePointersMade: 8,
    fieldGoalPercentage: 0.21,
    threePointPercentage: 0.25,
    freeThrowPercentage: 0,
    steals: 5,
    blocks: 2,
    minutes: 48,
    freeThrowAttempts: 0,
    mvpVotes: 0
  },
  {
    name: "A. Thamesh",
    team: "Los Sigmas",
    points: 0,
    careerHigh: 0,
    rebounds: 0,
    assists: 0,
    threePointersMade: 0,
    fieldGoalPercentage: 0,
    threePointPercentage: 0,
    freeThrowPercentage: 0,
    steals: 0,
    blocks: 0,
    minutes: 0,
    freeThrowAttempts: 0,
    mvpVotes: 0
  }
];

// Actual game data from CSV files
const gamesData: GameData[] = [
  {
    gameNumber: 1,
    date: "2024-01-15",
    team1Score: 82, // Golden Dragons
    team2Score: 100, // Los Sigmas
    team1Players: [
      {
        name: "J. Bai",
        points: 56,
        rebounds: 11,
        assists: 4,
        fgm: 21,
        fga: 69,
        fgPercentage: 0.30,
        threePM: 14,
        threePA: 56,
        threePPercentage: 0.25,
        ftm: 0,
        fta: 0,
        ftPercentage: 0,
        steals: 1,
        blocks: 4,
        minutes: 48
      },
      {
        name: "R. Yan",
        points: 26,
        rebounds: 40,
        assists: 11,
        fgm: 12,
        fga: 28,
        fgPercentage: 0.43,
        threePM: 2,
        threePA: 14,
        threePPercentage: 0.14,
        ftm: 0,
        fta: 0,
        ftPercentage: 0,
        steals: 3,
        blocks: 3,
        minutes: 48
      }
    ],
    team2Players: [
      {
        name: "A. Guo",
        points: 100,
        rebounds: 41,
        assists: 0,
        fgm: 44,
        fga: 89,
        fgPercentage: 0.49,
        threePM: 1,
        threePA: 2,
        threePPercentage: 0.50,
        ftm: 11,
        fta: 25,
        ftPercentage: 0.44,
        steals: 1,
        blocks: 2,
        minutes: 48
      }
    ]
  },
  {
    gameNumber: 2,
    date: "2024-01-22",
    team1Score: 81, // Golden Dragons
    team2Score: 107, // Los Sigmas
    team1Players: [
      {
        name: "J. Bai",
        points: 48,
        rebounds: 14,
        assists: 4,
        fgm: 18,
        fga: 83,
        fgPercentage: 0.22,
        threePM: 12,
        threePA: 70,
        threePPercentage: 0.17,
        ftm: 0,
        fta: 1,
        ftPercentage: 0.00,
        steals: 8,
        blocks: 1,
        minutes: 48
      },
      {
        name: "R. Yan",
        points: 33,
        rebounds: 17,
        assists: 10,
        fgm: 14,
        fga: 23,
        fgPercentage: 0.61,
        threePM: 4,
        threePA: 9,
        threePPercentage: 0.44,
        ftm: 1,
        fta: 1,
        ftPercentage: 1.00,
        steals: 4,
        blocks: 6,
        minutes: 48
      }
    ],
    team2Players: [
      {
        name: "A. Guo",
        points: 77,
        rebounds: 25,
        assists: 6,
        fgm: 37,
        fga: 57,
        fgPercentage: 0.65,
        threePM: 1,
        threePA: 4,
        threePPercentage: 0.25,
        ftm: 2,
        fta: 5,
        ftPercentage: 0.40,
        steals: 2,
        blocks: 4,
        minutes: 48
      },
      {
        name: "N. Ho",
        points: 30,
        rebounds: 15,
        assists: 4,
        fgm: 11,
        fga: 52,
        fgPercentage: 0.21,
        threePM: 8,
        threePA: 32,
        threePPercentage: 0.25,
        ftm: 0,
        fta: 0,
        ftPercentage: 0,
        steals: 5,
        blocks: 2,
        minutes: 48
      }
    ],
    quarters: {
      q1: { team1: 25, team2: 19 },
      q2: { team1: 39, team2: 58 },
      q3: { team1: 0, team2: 0 }, // Data shows "?" in CSV
      q4: { team1: 81, team2: 107 }
    }
  },
  {
    gameNumber: 3,
    date: "2024-01-29",
    team1Score: 52, // Golden Dragons
    team2Score: 50, // Los Sigmas
    team1Players: [
      {
        name: "J. Bai",
        points: 20,
        rebounds: 14,
        assists: 8,
        fgm: 7,
        fga: 32,
        fgPercentage: 0.22,
        threePM: 5,
        threePA: 25,
        threePPercentage: 0.20,
        ftm: 1,
        fta: 2,
        ftPercentage: 0.50,
        steals: 0,
        blocks: 2,
        minutes: 32
      },
      {
        name: "R. Yan",
        points: 32,
        rebounds: 25,
        assists: 4,
        fgm: 13,
        fga: 25,
        fgPercentage: 0.52,
        threePM: 3,
        threePA: 11,
        threePPercentage: 0.27,
        ftm: 3,
        fta: 6,
        ftPercentage: 0.50,
        steals: 0,
        blocks: 2,
        minutes: 32
      }
    ],
    team2Players: [
      {
        name: "A. Guo",
        points: 50,
        rebounds: 24,
        assists: 0,
        fgm: 18,
        fga: 46,
        fgPercentage: 0.39,
        threePM: 4,
        threePA: 7,
        threePPercentage: 0.57,
        ftm: 10,
        fta: 14,
        ftPercentage: 0.71,
        steals: 0,
        blocks: 3,
        minutes: 32
      }
    ],
    quarters: {
      q1: { team1: 11, team2: 14 },
      q2: { team1: 21, team2: 24 },
      q3: { team1: 38, team2: 42 },
      q4: { team1: 52, team2: 50 }
    }
  }
];

// Team records based on actual game results:
// Game 1: Los Sigmas 100, Golden Dragons 82 (Los Sigmas win)
// Game 2: Los Sigmas 107, Golden Dragons 81 (Los Sigmas win)
// Game 3: Golden Dragons 52, Los Sigmas 50 (Golden Dragons win)
// Final: Los Sigmas 2-1, Golden Dragons 1-2

const teamsData: Team[] = [
  {
    name: "Los Sigmas",
    players: playersData.filter(p => p.team === "Los Sigmas"),
    wins: 2,
    losses: 1,
    winPercentage: 67,
    color: "red",
    captains: [
      {
        userId: "captain1",
        email: "captain1@example.com",
        name: "Team Captain 1",
        appointedDate: new Date("2024-01-01"),
        permissions: ['manage_roster', 'propose_trades', 'set_lineups', 'manage_positions']
      }
    ],
    teamMotto: "Sigma Grindset",
    foundedDate: new Date("2024-01-01")
  },
  {
    name: "Golden Dragons",
    players: playersData.filter(p => p.team === "Golden Dragons"),
    wins: 1,
    losses: 2,
    winPercentage: 33,
    color: "yellow",
    captains: [
      {
        userId: "captain2",
        email: "captain2@example.com",
        name: "Team Captain 2",
        appointedDate: new Date("2024-01-01"),
        permissions: ['manage_roster', 'propose_trades', 'set_lineups', 'manage_positions', 'view_analytics']
      }
    ],
    teamMotto: "Rise Like Dragons",
    foundedDate: new Date("2024-01-01")
  }
];

const gameRecords: GameRecord[] = [
  {
    game: "Game 1",
    player: "A. Guo",
    achievement: "100 PTS, 41 REB, 49% FG",
    details: "Historic 100-point performance with 41 rebounds - a legendary display of dominance"
  },
  {
    game: "Game 2",
    player: "A. Guo",
    achievement: "77 PTS, 25 REB, 65% FG",
    details: "Exceptional efficiency with 77 points on 65% shooting"
  },
  {
    game: "Game 3",
    player: "A. Guo",
    achievement: "50 PTS, 24 REB, 3 BLK",
    details: "Complete two-way performance in a close 50-52 loss"
  }
];

const leagueRecords: LeagueRecord[] = [
  {
    category: "Points",
    value: 100,
    player: "A. Guo",
    description: "Single game scoring record"
  },
  {
    category: "Rebounds",
    value: 41,
    player: "A. Guo",
    description: "Single game rebounding record"
  },
  {
    category: "Assists",
    value: 11,
    player: "A. Guo",
    description: "Single game assists record"
  },
  {
    category: "3-Pointers Made",
    value: 14,
    player: "A. Guo",
    description: "Single game three-pointers made record"
  }
];

// Activity Feed Data
const activityFeedData: ActivityFeedItem[] = [
  {
    id: "1",
    type: "game",
    title: "Game 3 Completed",
    description: "Golden Dragons defeated Los Sigmas 52-50 in a thrilling matchup",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    teams: ["Golden Dragons", "Los Sigmas"],
    icon: "🏀"
  },
  {
    id: "2",
    type: "record",
    title: "New League Record!",
    description: "A. Guo set a new single-game scoring record with 100 points",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    players: ["A. Guo"],
    teams: ["Los Sigmas"],
    icon: "🔥"
  },
  {
    id: "3",
    type: "mvp",
    title: "MVP Voting Opened",
    description: "Public voting for season MVP is now live",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    icon: "⭐"
  },
  {
    id: "4",
    type: "game",
    title: "Game 2 Results",
    description: "Los Sigmas dominated Golden Dragons 107-81",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    teams: ["Los Sigmas", "Golden Dragons"],
    icon: "🏀"
  },
  {
    id: "5",
    type: "game",
    title: "Season Opener",
    description: "Los Sigmas started strong with a 100-82 victory over Golden Dragons",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    teams: ["Los Sigmas", "Golden Dragons"],
    icon: "🏀"
  }
];

// Free Agents Pool
const freeAgentsData: FreeAgent[] = [
  // Currently no free agents, but this will be populated when players are released
];

// Add "Free Agents" as a virtual team
const freeAgentTeam: Team = {
  name: "Free Agents",
  players: freeAgentsData.map(fa => ({ ...fa.player, team: "Free Agents" })),
  wins: 0,
  losses: 0,
  winPercentage: 0,
  color: "gray"
};

export function getAllPlayers(): Player[] {
  return playersData;
}

export function getPlayersByTeam(teamName: string): Player[] {
  return playersData.filter(player => player.team === teamName);
}

export function getPlayer(playerName: string): Player | undefined {
  return playersData.find(player => player.name === playerName);
}

export function getAllTeams(): Team[] {
  return [...teamsData, freeAgentTeam];
}

export function getActiveTeams(): Team[] {
  return teamsData;
}

export function getTeam(teamName: string): Team | undefined {
  return teamsData.find(team => team.name === teamName);
}

export function getLeagueData() {
  const standings = [...teamsData].sort((a, b) => b.winPercentage - a.winPercentage);
  return {
    teams: teamsData,
    standings,
    totalGames: 3
  };
}

export function getTopPerformers() {
  const activePlayers = playersData.filter(p => p.points > 0);

  const topScorer = activePlayers.reduce((prev, current) =>
    prev.points > current.points ? prev : current
  );

  const topRebounder = activePlayers.reduce((prev, current) =>
    prev.rebounds > current.rebounds ? prev : current
  );

  const topAssister = activePlayers.reduce((prev, current) =>
    prev.assists > current.assists ? prev : current
  );

  return {
    scoring: {
      name: topScorer.name,
      points: topScorer.points,
      team: topScorer.team
    },
    rebounding: {
      name: topRebounder.name,
      rebounds: topRebounder.rebounds,
      team: topRebounder.team
    },
    assists: {
      name: topAssister.name,
      assists: topAssister.assists,
      team: topAssister.team
    }
  };
}

export function getGameRecords(): GameRecord[] {
  return gameRecords;
}

export function getLeagueRecords(): LeagueRecord[] {
  return leagueRecords;
}

export function updateMVPVotes(playerName: string): boolean {
  const player = playersData.find(p => p.name === playerName);
  if (player) {
    player.mvpVotes = (player.mvpVotes || 0) + 1;
    return true;
  }
  return false;
}

export function getMVPLeaderboard(): Player[] {
  return playersData
    .filter(p => p.points > 0) // Only active players
    .sort((a, b) => (b.mvpVotes || 0) - (a.mvpVotes || 0));
}

export function getAllGames(): GameData[] {
  return gamesData;
}

export function getGame(gameNumber: number): GameData | undefined {
  return gamesData.find(game => game.gameNumber === gameNumber);
}

export function getRecentGames(): GameData[] {
  return gamesData.slice().reverse(); // Most recent first
}

export function getTeamGameStats(teamName: string) {
  const isLosSignas = teamName === "Los Sigmas";

  let totalPoints = 0;
  let totalPointsAllowed = 0;
  let gamesPlayed = 0;

  gamesData.forEach(game => {
    if (isLosSignas) {
      totalPoints += game.team2Score;
      totalPointsAllowed += game.team1Score;
    } else {
      totalPoints += game.team1Score;
      totalPointsAllowed += game.team2Score;
    }
    gamesPlayed++;
  });

  return {
    avgPointsScored: gamesPlayed > 0 ? (totalPoints / gamesPlayed).toFixed(1) : "0.0",
    avgPointsAllowed: gamesPlayed > 0 ? (totalPointsAllowed / gamesPlayed).toFixed(1) : "0.0",
    gamesPlayed
  };
}

// Activity Feed Functions
export function getActivityFeed(): ActivityFeedItem[] {
  return activityFeedData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function addActivityFeedItem(item: Omit<ActivityFeedItem, 'id'>): void {
  const newItem: ActivityFeedItem = {
    ...item,
    id: Date.now().toString()
  };
  activityFeedData.unshift(newItem);
}

// Free Agency Functions
export function getFreeAgents(): FreeAgent[] {
  return freeAgentsData;
}

export function releasePlayer(playerName: string, fromTeam: string, reason?: string): boolean {
  const playerIndex = playersData.findIndex(p => p.name === playerName && p.team === fromTeam);
  if (playerIndex === -1) return false;

  const player = playersData[playerIndex];

  // Add to free agents
  const freeAgent: FreeAgent = {
    player: { ...player, team: "Free Agents" },
    releaseDate: new Date(),
    releasedBy: fromTeam,
    reason
  };
  freeAgentsData.push(freeAgent);

  // Update player's team
  playersData[playerIndex].team = "Free Agents";

  // Update free agent team
  freeAgentTeam.players = freeAgentsData.map(fa => fa.player);

  // Add activity feed item
  addActivityFeedItem({
    type: 'release',
    title: `${player.name} Released`,
    description: `${fromTeam} has released ${player.name}${reason ? ` (${reason})` : ''}`,
    timestamp: new Date(),
    players: [player.name],
    teams: [fromTeam],
    icon: '📤'
  });

  return true;
}

export function signFreeAgent(playerName: string, toTeam: string): boolean {
  const freeAgentIndex = freeAgentsData.findIndex(fa => fa.player.name === playerName);
  if (freeAgentIndex === -1) return false;

  const freeAgent = freeAgentsData[freeAgentIndex];
  const playerIndex = playersData.findIndex(p => p.name === playerName);

  if (playerIndex === -1) return false;

  // Update player's team
  playersData[playerIndex].team = toTeam;

  // Remove from free agents
  freeAgentsData.splice(freeAgentIndex, 1);

  // Update free agent team
  freeAgentTeam.players = freeAgentsData.map(fa => fa.player);

  // Add activity feed item
  addActivityFeedItem({
    type: 'signing',
    title: `${freeAgent.player.name} Signed`,
    description: `${toTeam} has signed ${freeAgent.player.name} from free agency`,
    timestamp: new Date(),
    players: [freeAgent.player.name],
    teams: [toTeam],
    icon: '✍️'
  });

  return true;
}

export function addTradeActivity(fromTeam: string, toTeam: string, playersOffered: Player[], playersRequested: Player[]): void {
  const offeredNames = playersOffered.map(p => p.name).join(', ');
  const requestedNames = playersRequested.map(p => p.name).join(', ');

  addActivityFeedItem({
    type: 'trade',
    title: 'Trade Completed',
    description: `${fromTeam} traded ${offeredNames} to ${toTeam} for ${requestedNames}`,
    timestamp: new Date(),
    players: [...playersOffered.map(p => p.name), ...playersRequested.map(p => p.name)],
    teams: [fromTeam, toTeam],
    icon: '🔄'
  });
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

// Captain Management Functions
export function isTeamCaptain(userEmail: string, teamName: string): boolean {
  const team = teamsData.find(t => t.name === teamName);
  return team?.captains?.some(c => c.email === userEmail) || false;
}

export function getCaptainPermissions(userEmail: string, teamName: string): TeamPermission[] {
  const team = teamsData.find(t => t.name === teamName);
  const captain = team?.captains?.find(c => c.email === userEmail);
  return captain?.permissions || [];
}

export function hasPermission(userEmail: string, teamName: string, permission: TeamPermission): boolean {
  const permissions = getCaptainPermissions(userEmail, teamName);
  return permissions.includes(permission);
}

export function appointCaptain(teamName: string, userEmail: string, userName: string, permissions: TeamPermission[]): boolean {
  const teamIndex = teamsData.findIndex(t => t.name === teamName);
  if (teamIndex === -1) return false;

  const newCaptain: TeamCaptain = {
    userId: Date.now().toString(),
    email: userEmail,
    name: userName,
    appointedDate: new Date(),
    permissions
  };

  if (!teamsData[teamIndex].captains) {
    teamsData[teamIndex].captains = [];
  }

  // Remove existing captain with same email if exists
  teamsData[teamIndex].captains = teamsData[teamIndex].captains!.filter(c => c.email !== userEmail);

  // Add new captain
  teamsData[teamIndex].captains!.push(newCaptain);

  // Add activity feed item
  addActivityFeedItem({
    type: 'signing',
    title: 'New Team Captain',
    description: `${userName} has been appointed as captain of ${teamName}`,
    timestamp: new Date(),
    teams: [teamName],
    icon: '👑'
  });

  return true;
}

export function removeCaptain(teamName: string, userEmail: string): boolean {
  const teamIndex = teamsData.findIndex(t => t.name === teamName);
  if (teamIndex === -1) return false;

  const captain = teamsData[teamIndex].captains?.find(c => c.email === userEmail);
  if (!captain) return false;

  teamsData[teamIndex].captains = teamsData[teamIndex].captains!.filter(c => c.email !== userEmail);

  // Add activity feed item
  addActivityFeedItem({
    type: 'release',
    title: 'Captain Removed',
    description: `${captain.name} is no longer captain of ${teamName}`,
    timestamp: new Date(),
    teams: [teamName],
    icon: '👑'
  });

  return true;
}

// Position Management Functions
export function updatePlayerPosition(playerName: string, position: PlayerPosition): boolean {
  const playerIndex = playersData.findIndex(p => p.name === playerName);
  if (playerIndex === -1) return false;

  const oldPosition = playersData[playerIndex].position;
  playersData[playerIndex].position = position;

  // Add activity feed item
  addActivityFeedItem({
    type: 'signing',
    title: 'Position Update',
    description: `${playerName} position changed from ${oldPosition || 'Unassigned'} to ${position}`,
    timestamp: new Date(),
    players: [playerName],
    teams: [playersData[playerIndex].team],
    icon: '📋'
  });

  return true;
}

export function updatePlayerDetails(playerName: string, updates: Partial<Player>): boolean {
  const playerIndex = playersData.findIndex(p => p.name === playerName);
  if (playerIndex === -1) return false;

  playersData[playerIndex] = { ...playersData[playerIndex], ...updates };

  return true;
}

export function getPlayersByPosition(teamName: string, position: PlayerPosition): Player[] {
  return playersData.filter(p => p.team === teamName && p.position === position);
}

export function getTeamRoster(teamName: string): {
  guards: Player[];
  forwards: Player[];
  centers: Player[];
  utility: Player[];
  unassigned: Player[];
} {
  const teamPlayers = playersData.filter(p => p.team === teamName);

  return {
    guards: teamPlayers.filter(p => p.position === 'G'),
    forwards: teamPlayers.filter(p => p.position === 'F'),
    centers: teamPlayers.filter(p => p.position === 'C'),
    utility: teamPlayers.filter(p => p.position === 'UTIL'),
    unassigned: teamPlayers.filter(p => !p.position)
  };
}

export function getPositionColor(position?: PlayerPosition): string {
  switch (position) {
    case 'G': return 'bg-blue-600';
    case 'F': return 'bg-green-600';
    case 'C': return 'bg-purple-600';
    case 'UTIL': return 'bg-orange-600';
    default: return 'bg-gray-600';
  }
}

export function getPositionName(position?: PlayerPosition): string {
  switch (position) {
    case 'G': return 'Guard';
    case 'F': return 'Forward';
    case 'C': return 'Center';
    case 'UTIL': return 'Utility';
    default: return 'Unassigned';
  }
}

// Player Management Functions
export function addNewPlayer(playerData: Omit<Player, 'id'>): boolean {
  try {
    const newPlayer: Player = {
      ...playerData,
      id: Date.now().toString()
    };

    playersData.push(newPlayer);

    // If player is added as free agent, add to free agents list
    if (playerData.team === 'Free Agents') {
      const freeAgent: FreeAgent = {
        player: newPlayer,
        releaseDate: new Date(),
        releasedBy: 'System',
        reason: 'New player added as free agent'
      };
      freeAgentsData.push(freeAgent);
      freeAgentTeam.players = freeAgentsData.map(fa => fa.player);

      // Add activity feed item
      addActivityFeedItem({
        type: 'signing',
        title: `New Free Agent Available`,
        description: `${newPlayer.name} has been added to the free agent pool`,
        timestamp: new Date(),
        players: [newPlayer.name],
        icon: '🆓'
      });
    } else {
      // Add activity feed item for team signing
      addActivityFeedItem({
        type: 'signing',
        title: `New Player Added`,
        description: `${newPlayer.name} has joined ${playerData.team}`,
        timestamp: new Date(),
        players: [newPlayer.name],
        teams: [playerData.team],
        icon: '✍️'
      });
    }

    return true;
  } catch (error) {
    console.error('Error adding player:', error);
    return false;
  }
}

export function updatePlayer(playerName: string, updatedData: Partial<Player>): boolean {
  try {
    const playerIndex = playersData.findIndex(p => p.name === playerName);
    if (playerIndex === -1) return false;

    const oldTeam = playersData[playerIndex].team;
    playersData[playerIndex] = { ...playersData[playerIndex], ...updatedData };

    // Handle team changes
    if (updatedData.team && updatedData.team !== oldTeam) {
      // If moving to free agents
      if (updatedData.team === 'Free Agents') {
        const freeAgent: FreeAgent = {
          player: playersData[playerIndex],
          releaseDate: new Date(),
          releasedBy: oldTeam,
          reason: 'Player transfer'
        };
        freeAgentsData.push(freeAgent);
        freeAgentTeam.players = freeAgentsData.map(fa => fa.player);
      }
      // If moving from free agents to a team
      else if (oldTeam === 'Free Agents') {
        const freeAgentIndex = freeAgentsData.findIndex(fa => fa.player.name === playerName);
        if (freeAgentIndex !== -1) {
          freeAgentsData.splice(freeAgentIndex, 1);
          freeAgentTeam.players = freeAgentsData.map(fa => fa.player);
        }
      }

      // Add activity feed item
      addActivityFeedItem({
        type: 'signing',
        title: `Player Transfer`,
        description: `${playerName} has moved from ${oldTeam} to ${updatedData.team}`,
        timestamp: new Date(),
        players: [playerName],
        teams: [oldTeam, updatedData.team].filter(t => t !== 'Free Agents'),
        icon: '🔄'
      });
    }

    return true;
  } catch (error) {
    console.error('Error updating player:', error);
    return false;
  }
}
