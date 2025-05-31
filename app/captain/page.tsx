"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAllTeams,
  isTeamCaptain,
  getCaptainPermissions,
  hasPermission,
  getTeamRoster,
  updatePlayerPosition,
  updatePlayerDetails,
  Player,
  PlayerPosition,
  getPositionColor,
  getPositionName,
  TeamPermission
} from "@/lib/data";

export default function CaptainDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState(getAllTeams());
  const [userTeams, setUserTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [roster, setRoster] = useState<any>(null);
  const [permissions, setPermissions] = useState<TeamPermission[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showPositionModal, setShowPositionModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user?.email) {
      // Find teams where user is captain
      const captainTeams = teams
        .filter(team => isTeamCaptain(user.email!, team.name))
        .map(team => team.name);

      setUserTeams(captainTeams);

      if (captainTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(captainTeams[0]);
      }
    }
  }, [user, loading, router, teams, selectedTeam]);

  useEffect(() => {
    if (selectedTeam && user?.email) {
      setRoster(getTeamRoster(selectedTeam));
      setPermissions(getCaptainPermissions(user.email, selectedTeam));
    }
  }, [selectedTeam, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (userTeams.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-3xl font-bold text-white mb-4">No Captain Access</h1>
          <p className="text-gray-300 mb-6">You are not currently a team captain.</p>
          <Link
            href="/"
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handlePositionUpdate = (playerName: string, position: PlayerPosition) => {
    if (hasPermission(user.email!, selectedTeam, 'manage_positions')) {
      updatePlayerPosition(playerName, position);
      setRoster(getTeamRoster(selectedTeam));
      setShowPositionModal(false);
      setEditingPlayer(null);
    }
  };

  const handlePlayerEdit = (player: Player) => {
    setEditingPlayer(player);
    setShowPositionModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-3xl font-bold text-white hover:text-orange-400 transition-colors">
                <span className="text-orange-400">DBA</span> Captain
              </Link>
              <span className="text-gray-300 text-sm">Team Management Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white">
                👑 {user.email}
              </div>
              <Link
                href="/"
                className="text-white hover:text-orange-400 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Team Selection */}
          {userTeams.length > 1 && (
            <div className="mb-8">
              <label className="block text-white font-semibold mb-2">Select Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                {userTeams.map(teamName => (
                  <option key={teamName} value={teamName}>{teamName}</option>
                ))}
              </select>
            </div>
          )}

          {/* Team Info */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {selectedTeam} Captain Dashboard
            </h1>
            <div className="flex flex-wrap gap-2">
              {permissions.map(permission => (
                <span
                  key={permission}
                  className="px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full text-sm font-semibold"
                >
                  {permission.replace('_', ' ').toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Roster Management */}
          {roster && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Position Groups */}
              {[
                { key: 'guards', title: 'Guards (G)', color: 'bg-blue-600' },
                { key: 'forwards', title: 'Forwards (F)', color: 'bg-green-600' },
                { key: 'centers', title: 'Centers (C)', color: 'bg-purple-600' },
                { key: 'utility', title: 'Utility (UTIL)', color: 'bg-orange-600' },
                { key: 'unassigned', title: 'Unassigned', color: 'bg-gray-600' }
              ].map(({ key, title, color }) => (
                <div key={key} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                  <div className={`${color} p-4`}>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <p className="text-gray-200 text-sm">
                      {roster[key].length} player{roster[key].length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="p-4">
                    {roster[key].length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No players assigned</p>
                    ) : (
                      <div className="space-y-3">
                        {roster[key].map((player: Player) => (
                          <div key={player.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 ${getPositionColor(player.position)} rounded-full flex items-center justify-center`}>
                                <span className="text-white font-bold text-sm">
                                  {player.jerseyNumber || player.position || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-white">{player.name}</p>
                                <p className="text-gray-300 text-sm">
                                  {player.height && player.weight ? `${player.height}, ${player.weight}` : 'No physical data'}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {player.points} PPG, {player.rebounds} RPG, {player.assists} APG
                                </p>
                              </div>
                            </div>

                            {hasPermission(user.email!, selectedTeam, 'manage_positions') && (
                              <button
                                onClick={() => handlePlayerEdit(player)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {hasPermission(user.email!, selectedTeam, 'propose_trades') && (
              <Link
                href="/admin/teams"
                className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl text-center transition-colors"
              >
                <div className="text-3xl mb-2">🔄</div>
                <h3 className="font-bold">Propose Trade</h3>
                <p className="text-sm opacity-90">Initiate player trades</p>
              </Link>
            )}

            {hasPermission(user.email!, selectedTeam, 'view_analytics') && (
              <Link
                href={`/teams/${selectedTeam}`}
                className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl text-center transition-colors"
              >
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-bold">Team Analytics</h3>
                <p className="text-sm opacity-90">View team statistics</p>
              </Link>
            )}

            {hasPermission(user.email!, selectedTeam, 'manage_roster') && (
              <Link
                href="/admin/players"
                className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl text-center transition-colors"
              >
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-bold">Manage Roster</h3>
                <p className="text-sm opacity-90">Add/edit players</p>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Position Edit Modal */}
      {showPositionModal && editingPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">Edit Player Position</h3>
              <div className="mb-4">
                <div className={`w-16 h-16 ${getPositionColor(editingPlayer.position)} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-white font-bold text-lg">
                    {editingPlayer.jerseyNumber || editingPlayer.position || '?'}
                  </span>
                </div>
                <p className="text-white font-semibold">{editingPlayer.name}</p>
                <p className="text-gray-300 text-sm">
                  Current: {getPositionName(editingPlayer.position)}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {(['G', 'F', 'C', 'UTIL'] as PlayerPosition[]).map((position) => (
                  <button
                    key={position}
                    onClick={() => handlePositionUpdate(editingPlayer.name, position)}
                    className={`w-full p-3 rounded-lg font-semibold transition-colors ${
                      editingPlayer.position === position
                        ? `${getPositionColor(position)} text-white`
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {getPositionName(position)} ({position})
                  </button>
                ))}
              </div>

              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => {
                    setShowPositionModal(false);
                    setEditingPlayer(null);
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Denlow Basketball Association. Captain Dashboard.</p>
        </div>
      </footer>
    </div>
  );
}
