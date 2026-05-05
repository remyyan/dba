/* eslint-disable */
// @ts-nocheck
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAllTeams, getAllGames, getAllPlayers, calculatePlayerScore, CURRENT_SEASON, ALL_SEASONS, getAwardVotes, castAwardVote, AwardType } from "@/lib/firebase-data";
import Navigation from "@/components/Navigation";
import ActivityFeed from "@/components/ActivityFeed";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [teams, setTeams] = useState<any[]>([]);
  const [allGames, setAllGames] = useState<any[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [teamPlayerCounts, setTeamPlayerCounts] = useState<{[key: string]: number}>({});
  const [teamRecords, setTeamRecords] = useState<{[key: string]: {wins: number, losses: number, winPercentage: number}}>({});
  const [seasonAwards, setSeasonAwards] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);
  const [loading, setLoading] = useState(true);
  const [awardVotes, setAwardVotes] = useState<Record<AwardType, Record<string, string>>>({} as any);
  const [myVotes, setMyVotes] = useState<Record<AwardType, string>>({} as any);
  const [votingAward, setVotingAward] = useState<AwardType | null>(null);
  const [openPicker, setOpenPicker] = useState<AwardType | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsData, gamesData, playersData] = await Promise.all([
          getAllTeams(),
          getAllGames(),
          getAllPlayers()
        ]);

        // Remove duplicates if they exist - keep the first occurrence of each team name
        const uniqueTeams = teamsData.filter((team, index, self) =>
          index === self.findIndex(t => t.name === team.name)
        );

        console.log('Teams loaded:', {
          total: teamsData.length,
          unique: uniqueTeams.length,
          teamNames: uniqueTeams.map(t => t.name)
        });

        // Calculate player counts for each team
        const playerCounts: {[key: string]: number} = {};
        for (const team of uniqueTeams) {
          playerCounts[team.name] = playersData.filter((p: any) => p.team === team.name).length;
        }

        setTeams(uniqueTeams);
        setTeamPlayerCounts(playerCounts);
        setAllGames(gamesData);
        setAllPlayers(playersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter games and compute team records by selected season
  useEffect(() => {
    const seasonGames = allGames.filter(g => g.season === selectedSeason);
    setRecentGames(seasonGames.slice(-3).reverse()); // Last 3 games of selected season

    // Compute team records from season games
    const records: {[key: string]: {wins: number, losses: number, winPercentage: number}} = {};

    for (const team of teams) {
      records[team.name] = { wins: 0, losses: 0, winPercentage: 0 };
    }

    for (const game of seasonGames) {
      if (records[game.team1] && records[game.team2]) {
        if (game.team1Score > game.team2Score) {
          records[game.team1].wins++;
          records[game.team2].losses++;
        } else if (game.team2Score > game.team1Score) {
          records[game.team2].wins++;
          records[game.team1].losses++;
        }
      }
    }

    // Calculate win percentages
    for (const teamName of Object.keys(records)) {
      const total = records[teamName].wins + records[teamName].losses;
      records[teamName].winPercentage = total > 0 ? Math.round((records[teamName].wins / total) * 100) : 0;
    }

    setTeamRecords(records);

    const buildPlayerStats = (games: any[]) => {
      const map = new Map<string, any>();

      const addPerformance = (perf: any, team: string) => {
        if (!perf || !perf.playerName) return;
        const key = perf.playerId || perf.playerName.toLowerCase();
        const existing = map.get(key) || {
          id: perf.playerId,
          name: perf.playerName,
          team,
          gamesPlayed: 0,
          points: 0,
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          minutes: 0,
          fgm: 0,
          fga: 0,
          threePM: 0,
          threePA: 0,
          ftm: 0,
          fta: 0,
          efficiency: 0,
          playerScore: 0,
          rawEfficiency: 0,
          rawPlayerScore: 0
        };

        existing.gamesPlayed += 1;
        existing.points += perf.points || 0;
        existing.rebounds += perf.rebounds || 0;
        existing.assists += perf.assists || 0;
        existing.steals += perf.steals || 0;
        existing.blocks += perf.blocks || 0;
        existing.turnovers += perf.turnovers || 0;
        existing.minutes += perf.minutes || 0;
        existing.fgm += perf.fgm || 0;
        existing.fga += perf.fga || 0;
        existing.threePM += perf.threePM || 0;
        existing.threePA += perf.threePA || 0;
        existing.ftm += perf.ftm || 0;
        existing.fta += perf.fta || 0;

        const efficiency = Number.isFinite(perf.efficiency) ? perf.efficiency : 0;
        existing.rawEfficiency += efficiency;
        existing.rawPlayerScore += (perf.playerScore ?? calculatePlayerScore(perf));
        existing.team = team;

        map.set(key, existing);
      };

      for (const game of games) {
        for (const perf of game.team1Players || []) {
          addPerformance(perf, game.team1);
        }
        for (const perf of game.team2Players || []) {
          addPerformance(perf, game.team2);
        }
      }

      return Array.from(map.values()).map(player => {
        const gp = player.gamesPlayed || 1;
        return {
          ...player,
          points: player.points / gp,
          rebounds: player.rebounds / gp,
          assists: player.assists / gp,
          steals: player.steals / gp,
          blocks: player.blocks / gp,
          turnovers: player.turnovers / gp,
          minutes: player.minutes / gp,
          fgPercentage: player.fga > 0 ? player.fgm / player.fga : 0,
          threePPercentage: player.threePA > 0 ? player.threePM / player.threePA : 0,
          ftPercentage: player.fta > 0 ? player.ftm / player.fta : 0,
          efficiency: player.rawEfficiency / gp,
          playerScore: player.rawPlayerScore / gp,
          impactRating: ((player.playerScore || 0) + (player.efficiency || 0)) / 2,
          defensiveRating: (player.steals + player.blocks) / gp,
          perMinuteImpact: gp > 0 ? player.rawPlayerScore / player.minutes : 0
        };
      });
    };

    const currentSeasonStats = buildPlayerStats(seasonGames);
    const previousSeasonIndex = ALL_SEASONS.findIndex(season => season === selectedSeason) - 1;
    const previousSeason = previousSeasonIndex >= 0 ? ALL_SEASONS[previousSeasonIndex] : null;
    const previousSeasonGames = previousSeason ? allGames.filter(g => g.season === previousSeason) : [];
    const previousSeasonStats = previousSeason ? buildPlayerStats(previousSeasonGames) : [];
    const previousStatsMap = new Map(previousSeasonStats.map((player: any) => [player.id || player.name.toLowerCase(), player]));

    const topN = (list: any[], selector: (player: any) => number, n = 3) =>
      list.filter(p => p.gamesPlayed >= 1).sort((a, b) => selector(b) - selector(a)).slice(0, n);

    const mvp = topN(currentSeasonStats, p => p.playerScore);
    const dpoy = topN(currentSeasonStats, p => p.steals + p.blocks);
    const cpoy = topN(currentSeasonStats, p => (p.playerScore || 0) * (p.fgPercentage || 0));
    const smoty = topN(
      currentSeasonStats.filter(p => p.minutes < 28),
      p => p.perMinuteImpact
    );
    const mip = topN(currentSeasonStats, p => p.playerScore);
    const allPlayers = currentSeasonStats.filter(p => p.gamesPlayed >= 1).sort((a, b) => a.name.localeCompare(b.name));

    setSeasonAwards({ selectedSeason, mvp, dpoy, mip, cpoy, smoty, allPlayers });
  }, [allGames, teams, selectedSeason]);

  // Load votes whenever season changes
  useEffect(() => {
    const awards: AwardType[] = ['mvp', 'dpoy', 'mip', 'cpoy', 'smoty'];
    Promise.all(awards.map(a => getAwardVotes(selectedSeason, a))).then(results => {
      const all = {} as Record<AwardType, Record<string, string>>;
      awards.forEach((a, i) => { all[a] = results[i]; });
      setAwardVotes(all);
      if (user) {
        const mine = {} as Record<AwardType, string>;
        awards.forEach(a => { if (all[a][user.uid]) mine[a] = all[a][user.uid]; });
        setMyVotes(mine);
      }
    });
  }, [selectedSeason, user]);

  const handleVote = async (award: AwardType, playerName: string) => {
    if (!user || votingAward) return;
    setVotingAward(award);
    try {
      await castAwardVote(selectedSeason, award, user.uid, playerName);
      setMyVotes(prev => ({ ...prev, [award]: playerName }));
      setAwardVotes(prev => ({
        ...prev,
        [award]: { ...prev[award], [user.uid]: playerName },
      }));
    } finally {
      setVotingAward(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-white text-xl">Loading DBA data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            <span className="text-orange-400">DBA</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Denlow Basketball Association
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Home of the Golden Dragons and Los Sigmas - Where basketball legends are born.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/teams"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Teams
            </Link>
            <Link
              href="/games"
              className="border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Game History
            </Link>
          </div>
        </div>
      </section>

      {/* Teams Overview */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h3 className="text-3xl font-bold text-white">Team Standings</h3>
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 text-sm">Season:</span>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                {ALL_SEASONS.map(season => (
                  <option key={season} value={season} className="bg-slate-800">{season}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {teams.map((team, index) => {
              const record = teamRecords[team.name] || { wins: 0, losses: 0, winPercentage: 0 };
              return (
              <Link key={team.id || `${team.name}-${index}`} href={`/teams/${encodeURIComponent(team.name)}?season=${selectedSeason}`}>
                <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all cursor-pointer ${
                  team.name === 'Golden Dragons' ? 'hover:border-yellow-400' : 'hover:border-red-400'
                }`}>
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 ${
                      team.name === 'Golden Dragons' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {team.name === 'Golden Dragons' ? '🐉' : '🔥'}
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">{team.name}</h4>
                    <p className="text-gray-300 text-lg mb-4">{record.wins}-{record.losses} ({record.winPercentage}%)</p>
                    <p className="text-gray-400">
                      {teamPlayerCounts[team.name] || 0} Players
                    </p>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Season Awards */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-white">Season Awards Race</h3>
            <p className="text-gray-400">Top candidates for MVP, DPOY, MIP, CPOY, and SMOTY.</p>
          </div>
          {!user && (
            <p className="mb-4 text-gray-500 text-sm">
              <Link href="/login" className="text-orange-400 hover:text-orange-300">Sign in</Link> to vote.
            </p>
          )}
          <div className="grid md:grid-cols-5 gap-4">
            {([
              { key: 'mvp' as AwardType, label: 'MVP', desc: 'Most Valuable Player', candidates: seasonAwards?.mvp,
                stat: (p: any) => `${p.playerScore.toFixed(1)} score`, sortVal: (p: any) => p.playerScore },
              { key: 'dpoy' as AwardType, label: 'DPOY', desc: 'Defensive Player of the Year', candidates: seasonAwards?.dpoy,
                stat: (p: any) => `${(p.steals + p.blocks).toFixed(1)} stl+blk`, sortVal: (p: any) => p.steals + p.blocks },
              { key: 'mip' as AwardType, label: 'MIP', desc: 'Most Improved Player', candidates: seasonAwards?.mip,
                stat: (p: any) => `${p.playerScore.toFixed(1)} score`, sortVal: (p: any) => p.playerScore },
              { key: 'cpoy' as AwardType, label: 'CPOY', desc: 'Clutch Player of the Year', candidates: seasonAwards?.cpoy,
                stat: (p: any) => `${((p.fgPercentage || 0) * 100).toFixed(1)}% FG`, sortVal: (p: any) => (p.playerScore || 0) * (p.fgPercentage || 0) },
              { key: 'smoty' as AwardType, label: '6MOY', desc: 'Sixth Man of the Year', candidates: seasonAwards?.smoty,
                stat: (p: any) => `${p.perMinuteImpact.toFixed(2)}/min`, sortVal: (p: any) => p.perMinuteImpact },
            ]).map((award) => {
              const votes = awardVotes[award.key] || {};
              const totalVotes = Object.keys(votes).length;
              const voteCounts: Record<string, number> = {};
              Object.values(votes).forEach(name => { voteCounts[name] = (voteCounts[name] || 0) + 1; });
              const myPick = myVotes[award.key];
              const isPicker = openPicker === award.key;
              const allPlayers: any[] = seasonAwards?.allPlayers || [];
              // Sort full pool by votes then stat, take top 3, pin myPick if outside
              const sortedAll = [...allPlayers].sort((a, b) => {
                const vDiff = (voteCounts[b.name] || 0) - (voteCounts[a.name] || 0);
                return vDiff !== 0 ? vDiff : award.sortVal(b) - award.sortVal(a);
              });
              let sorted = sortedAll.slice(0, 3);
              if (myPick && !sorted.find(p => p.name === myPick)) {
                const myPlayer = allPlayers.find(p => p.name === myPick);
                if (myPlayer) sorted = [...sorted.slice(0, 2), myPlayer];
              }
              const filtered = allPlayers.filter(p =>
                p.name.toLowerCase().includes(pickerSearch.toLowerCase())
              );

              const CandidateRow = ({ p, i, ranked }: { p: any; i: number; ranked: boolean }) => {
                const voteCount = voteCounts[p.name] || 0;
                const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                const isMyPick = myPick === p.name;
                return (
                  <div className={`rounded-lg p-2.5 transition-colors ${isMyPick ? 'bg-orange-500/15 border border-orange-500/30' : 'bg-white/5'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {ranked && <span className="text-gray-600 text-xs w-3">{i + 1}</span>}
                        <span className="text-white text-sm font-medium">{p.name}</span>
                      </div>
                      {user && (
                        <button
                          disabled={!!votingAward}
                          onClick={() => { handleVote(award.key, p.name); setOpenPicker(null); setPickerSearch(''); }}
                          className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                            isMyPick ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                          } disabled:opacity-50`}
                        >
                          {isMyPick ? '✓ voted' : 'vote'}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-600 text-[10px] w-14 text-right">{award.stat(p)} · {voteCount}v</span>
                    </div>
                  </div>
                );
              };

              return (
                <div key={award.key} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-4 pt-4 pb-3 border-b border-white/10">
                    <div className="text-xs text-gray-500 uppercase tracking-widest">{award.label}</div>
                    <div className="text-white font-semibold text-sm">{award.desc}</div>
                  </div>

                  {isPicker ? (
                    <div className="px-4 py-3">
                      <input
                        autoFocus
                        value={pickerSearch}
                        onChange={e => setPickerSearch(e.target.value)}
                        placeholder="Search player…"
                        className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 mb-2"
                      />
                      <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        {filtered.map((p, i) => (
                          <CandidateRow key={p.name} p={p} i={i} ranked={false} />
                        ))}
                        {filtered.length === 0 && <p className="text-gray-600 text-sm">No players found</p>}
                      </div>
                      <button
                        onClick={() => { setOpenPicker(null); setPickerSearch(''); }}
                        className="mt-2 text-gray-500 hover:text-white text-xs transition-colors"
                      >
                        ← back to top 3
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="px-4 py-3 space-y-2">
                        {(award.candidates || []).length === 0 ? (
                          <p className="text-gray-600 text-sm">No data yet</p>
                        ) : sorted.map((p: any, i: number) => (
                          <CandidateRow key={p.name} p={p} i={i} ranked={true} />
                        ))}
                      </div>
                      <div className="px-4 pb-3 flex items-center justify-between">
                        <span className="text-gray-600 text-[10px]">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                        {user && (
                          <button
                            onClick={() => { setOpenPicker(award.key); setPickerSearch(''); }}
                            className="text-gray-500 hover:text-white text-[10px] transition-colors"
                          >
                            choose other →
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Games */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h3 className="text-3xl font-bold text-white">Recent Games</h3>
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 text-sm">Season:</span>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                {ALL_SEASONS.map(season => (
                  <option key={season} value={season} className="bg-slate-800">{season}</option>
                ))}
              </select>
            </div>
          </div>
          {recentGames.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No games found for {selectedSeason}.</p>
            </div>
          ) : (
          <div className="space-y-4">
            {recentGames.map((game) => (
              <Link key={game.gameNumber} href={`/games/${game.gameNumber}?season=${selectedSeason}`}>
                <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Game {game.gameNumber}</p>
                        <p className="text-sm text-gray-400">{game.date}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white font-semibold">{game.team1}</p>
                          <p className="text-2xl font-bold text-white">{game.team1Score}</p>
                        </div>
                        <div className="text-gray-400 text-xl">vs</div>
                        <div className="text-left">
                          <p className="text-white font-semibold">{game.team2}</p>
                          <p className="text-2xl font-bold text-white">{game.team2Score}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        game.team1Score > game.team2Score ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {game.team1Score > game.team2Score ? `${game.team1} Win` : `${game.team2} Win`}
                      </p>
                      <p className="text-gray-400 text-sm">View Box Score →</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
          <div className="text-center mt-8">
            <Link
              href="/games"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Games
            </Link>
          </div>
        </div>
      </section>

      {/* Activity Feed */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Recent Activity</h3>
          <ActivityFeed />
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
