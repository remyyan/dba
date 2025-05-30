export interface Player {
  id?: string;
  name: string;
  team: string;
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
}

export interface Team {
  id?: string;
  name: string;
  players: Player[];
  wins: number;
  losses: number;
  winPercentage: number;
  color: string;
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

// Raw data from CSV converted to structured format
const playersData: Player[] = [
  // Golden Dragons
  {
    name: "J. Bai",
    team: "Golden Dragons",
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
    color: "red"
  },
  {
    name: "Golden Dragons",
    players: playersData.filter(p => p.team === "Golden Dragons"),
    wins: 1,
    losses: 2,
    winPercentage: 33,
    color: "yellow"
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
