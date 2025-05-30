import Link from "next/link";
import { getGameRecords, getAllTeams, getRecentGames } from "@/lib/data";

export default function GamesPage() {
  const gameRecords = getGameRecords();
  const teams = getAllTeams();
  const recentGames = getRecentGames();

  // Convert game data to display format
  const displayGames = recentGames.map(game => ({
    id: game.gameNumber,
    date: game.date,
    homeTeam: "Los Sigmas", // Team 2 in our data
    awayTeam: "Golden Dragons", // Team 1 in our data
    homeScore: game.team2Score,
    awayScore: game.team1Score,
    status: "Final",
    highlights: getGameHighlights(game),
    quarters: game.quarters
  }));

  function getGameHighlights(game: any) {
    const topPerformer = [...game.team1Players, ...game.team2Players]
      .reduce((prev, current) => prev.points > current.points ? prev : current);

    return `${topPerformer.name}: ${topPerformer.points} PTS, ${topPerformer.rebounds} REB`;
  }

  const upcomingGames = [
    {
      id: 4,
      date: "2024-02-05",
      homeTeam: "Golden Dragons",
      awayTeam: "Los Sigmas",
      time: "7:00 PM",
      status: "Scheduled",
      venue: "Denlow Arena"
    },
    {
      id: 5,
      date: "2024-02-12",
      homeTeam: "Los Sigmas",
      awayTeam: "Golden Dragons",
      time: "7:30 PM",
      status: "Scheduled",
      venue: "Sigma Center"
    }
  ];

  const getTeamColor = (teamName: string) => {
    return teamName === 'Golden Dragons' ? 'bg-yellow-600' : 'bg-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-3xl font-bold text-white hover:text-orange-400 transition-colors">
                <span className="text-orange-400">DBA</span> League
              </Link>
              <span className="text-gray-300 text-sm">Games & Schedule</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-white hover:text-orange-400 transition-colors">Home</Link>
              <Link href="/teams" className="text-white hover:text-orange-400 transition-colors">Teams</Link>
              <Link href="/players" className="text-white hover:text-orange-400 transition-colors">Players</Link>
              <Link href="/standings" className="text-white hover:text-orange-400 transition-colors">Standings</Link>
              <Link href="/mvp-voting" className="text-white hover:text-orange-400 transition-colors">MVP Voting</Link>
              <Link href="/records" className="text-white hover:text-orange-400 transition-colors">Records</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Games & Schedule</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Follow all the action from the DBA season - recent results and upcoming matchups
          </p>
        </div>
      </section>

      {/* Season Overview */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Season Overview</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">3</p>
                <p className="text-gray-300">Games Played</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">2</p>
                <p className="text-gray-300">Upcoming Games</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">100</p>
                <p className="text-gray-300">Highest Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">2-1</p>
                <p className="text-gray-300">Series Leader</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Games */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Recent Games</h2>

          <div className="space-y-6">
            {displayGames.map((game) => (
              <div key={game.id} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {game.status}
                      </span>
                      <span className="text-gray-300">{new Date(game.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">Game {game.id}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    {/* Away Team */}
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end space-x-3 mb-2">
                        <div className={`w-12 h-12 ${getTeamColor(game.awayTeam)} rounded-full flex items-center justify-center`}>
                          <span className="text-white font-bold">
                            {game.awayTeam.split(' ').map(word => word[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{game.awayTeam}</p>
                          <p className="text-gray-300 text-sm">Away</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-white">{game.awayScore}</p>
                    </div>

                    {/* VS and Score */}
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-400 mb-2">VS</p>
                      <p className="text-gray-300 text-sm">Final Score</p>
                    </div>

                    {/* Home Team */}
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                        <div className={`w-12 h-12 ${getTeamColor(game.homeTeam)} rounded-full flex items-center justify-center`}>
                          <span className="text-white font-bold">
                            {game.homeTeam.split(' ').map(word => word[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{game.homeTeam}</p>
                          <p className="text-gray-300 text-sm">Home</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-white">{game.homeScore}</p>
                    </div>
                  </div>

                  {/* Quarter Scores */}
                  {game.quarters && (
                    <div className="mt-6 p-4 bg-white/5 rounded-lg">
                      <h4 className="text-orange-400 font-semibold mb-3">Quarter by Quarter</h4>
                      <div className="grid grid-cols-5 gap-4 text-center">
                        <div className="font-semibold text-gray-300">Team</div>
                        <div className="font-semibold text-gray-300">Q1</div>
                        <div className="font-semibold text-gray-300">Q2</div>
                        <div className="font-semibold text-gray-300">Q3</div>
                        <div className="font-semibold text-gray-300">Q4</div>

                        <div className="text-white font-semibold">{game.awayTeam}</div>
                        <div className="text-white">{game.quarters.q1.team1}</div>
                        <div className="text-white">{game.quarters.q2.team1}</div>
                        <div className="text-white">{game.quarters.q3.team1 || '-'}</div>
                        <div className="text-white">{game.quarters.q4.team1}</div>

                        <div className="text-white font-semibold">{game.homeTeam}</div>
                        <div className="text-white">{game.quarters.q1.team2}</div>
                        <div className="text-white">{game.quarters.q2.team2}</div>
                        <div className="text-white">{game.quarters.q3.team2 || '-'}</div>
                        <div className="text-white">{game.quarters.q4.team2}</div>
                      </div>
                    </div>
                  )}

                  {/* Game Highlights */}
                  <div className="mt-6 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-orange-400 font-semibold mb-2">Game Highlights</h4>
                        <p className="text-gray-300">{game.highlights}</p>
                      </div>
                      <Link
                        href={`/games/${game.id}`}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Games */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Upcoming Games</h2>

          <div className="space-y-6">
            {upcomingGames.map((game) => (
              <div key={game.id} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {game.status}
                      </span>
                      <span className="text-gray-300">{new Date(game.date).toLocaleDateString()}</span>
                      <span className="text-gray-300">{game.time}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">Game {game.id}</p>
                      <p className="text-gray-300 text-sm">{game.venue}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    {/* Away Team */}
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end space-x-3 mb-2">
                        <div className={`w-12 h-12 ${getTeamColor(game.awayTeam)} rounded-full flex items-center justify-center`}>
                          <span className="text-white font-bold">
                            {game.awayTeam.split(' ').map(word => word[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{game.awayTeam}</p>
                          <p className="text-gray-300 text-sm">Away</p>
                        </div>
                      </div>
                      <p className="text-gray-400">TBD</p>
                    </div>

                    {/* VS */}
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-400 mb-2">VS</p>
                      <p className="text-gray-300 text-sm">{game.time}</p>
                    </div>

                    {/* Home Team */}
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                        <div className={`w-12 h-12 ${getTeamColor(game.homeTeam)} rounded-full flex items-center justify-center`}>
                          <span className="text-white font-bold">
                            {game.homeTeam.split(' ').map(word => word[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{game.homeTeam}</p>
                          <p className="text-gray-300 text-sm">Home</p>
                        </div>
                      </div>
                      <p className="text-gray-400">TBD</p>
                    </div>
                  </div>

                  {/* Game Preview */}
                  <div className="mt-6 p-4 bg-white/5 rounded-lg">
                    <h4 className="text-orange-400 font-semibold mb-2">Game Preview</h4>
                    <p className="text-gray-300">
                      {game.homeTeam} hosts {game.awayTeam} in what promises to be an exciting matchup.
                      Current series stands at {game.homeTeam === 'Los Sigmas' ? 'Los Sigmas 2-1' : 'Los Sigmas 2-1'}.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Season Stats */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Season Statistics</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-4">Highest Scoring Game</h3>
              <p className="text-3xl font-bold text-white mb-2">125-98</p>
              <p className="text-gray-300">Los Sigmas vs Golden Dragons</p>
              <p className="text-gray-400 text-sm">January 15, 2024</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-4">Closest Game</h3>
              <p className="text-3xl font-bold text-white mb-2">105-92</p>
              <p className="text-gray-300">Los Sigmas vs Golden Dragons</p>
              <p className="text-gray-400 text-sm">January 29, 2024</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-4">Average Score</h3>
              <p className="text-3xl font-bold text-white mb-2">108-94</p>
              <p className="text-gray-300">Per Game Average</p>
              <p className="text-gray-400 text-sm">3 games played</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Denlow Basketball Association. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
