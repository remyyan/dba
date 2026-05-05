"use client";

import { notFound, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, use, useRef } from "react";
import { getGame, calculatePlayerScore, loadGameShotData, CURRENT_SEASON, ShotEntry, HighlightEntry } from "@/lib/firebase-data";
import Navigation from "@/components/Navigation";

interface PageProps {
  params: Promise<{ gameNumber: string; playerId: string }>;
}

const BADGE_DESCRIPTIONS: Record<string, string> = {
  "Scoring Star": "18+ pts on 48%+ FG",
  "Sniper": "35%+ from 3 on 1.5+ attempts",
  "Lockdown": "1.5+ steals or 1.2+ blocks",
  "Playmaker": "5+ assists",
  "High Impact": "18+ player score",
  "Efficient": "20+ efficiency rating",
};

export default function PlayerGamePage({ params }: PageProps) {
  const { gameNumber: gameNumStr, playerId } = use(params);
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get("season") || CURRENT_SEASON;

  const [game, setGame] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [shots, setShots] = useState<ShotEntry[]>([]);
  const [highlights, setHighlights] = useState<HighlightEntry[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const gameData = await getGame(parseInt(gameNumStr), seasonParam);
        if (!gameData) { notFound(); return; }

        const allPlayers = [
          ...(gameData.team1Players || []),
          ...(gameData.team2Players || []),
        ];
        const found = allPlayers.find(
          (p: any) => p.playerId === playerId || p.playerName?.toLowerCase().replace(/\s+/g, "-") === playerId
        );
        if (!found) { notFound(); return; }

        setGame(gameData);
        setPlayer({ ...found, playerScore: calculatePlayerScore(found) });
        const shotData = await loadGameShotData(parseInt(gameNumStr), seasonParam);
        if (shotData) {
          setShots(shotData.shots.filter(s => s.playerId === playerId));
          setHighlights(shotData.highlights.filter(h => h.playerId === playerId));
        }
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gameNumStr, playerId, seasonParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!game || !player) return null;

  const getPlayerBadges = (stats: any) => {
    const badges: string[] = [];
    if (stats.points >= 18 && stats.fgPercentage >= 0.48) badges.push("Scoring Star");
    if (stats.threePPercentage >= 0.35 && stats.threePM >= 1.5) badges.push("Sniper");
    if (stats.steals >= 1.5 || stats.blocks >= 1.2) badges.push("Lockdown");
    if (stats.assists >= 5) badges.push("Playmaker");
    if (stats.playerScore >= 18) badges.push("High Impact");
    if (stats.efficiency >= 20) badges.push("Efficient");
    return badges.slice(0, 3);
  };

  const fmt = (n: number) => (n == null ? "0" : n.toString());
  const pct = (n: number) => (n == null || n === 0 ? "0%" : (n * 100).toFixed(0) + "%");

  const describeShotLabel = (shot: ShotEntry): string => {
    if (shot.type === 'FT') return 'free throw';
    const ft = shot.distanceFt;
    if (shot.type === '3P') {
      if (ft >= 30) return `${ft}ft bomb`;
      if (ft >= 27) return `${ft}ft deep three`;
      return `${ft}ft three pointer`;
    }
    if (ft <= 3) return 'layup';
    if (ft <= 6) return `${ft}ft floater`;
    if (ft <= 10) return `${ft}ft short mid`;
    return `${ft}ft midrange`;
  };

  const badges = getPlayerBadges(player);
  const isTeam1 = game.team1Players?.some((p: any) => p.playerName === player.playerName);
  const teamColor = isTeam1
    ? game.team1 === "Golden Dragons" ? "bg-yellow-600" : "bg-red-600"
    : game.team2 === "Golden Dragons" ? "bg-yellow-600" : "bg-red-600";

  const won = isTeam1
    ? game.team1Score > game.team2Score
    : game.team2Score > game.team1Score;

  const myScore = isTeam1 ? game.team1Score : game.team2Score;
  const oppScore = isTeam1 ? game.team2Score : game.team1Score;
  const oppTeam = isTeam1 ? game.team2 : game.team1;

  const efficiency = player.fgm + player.rebounds + player.assists + player.steals + player.blocks
    - (player.fga - player.fgm) - (player.fta - player.ftm) - (player.turnovers || 0);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    setShareMsg("");
    try {
      const { toPng } = await import("html-to-image");

      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#161616",
        pixelRatio: 2,
      });

      const pageUrl = window.location.href;

      const toBlob = (url: string): Promise<Blob> =>
        fetch(url).then(r => r.blob());

      // Try native share sheet first (mobile)
      if (navigator.share) {
        const blob = await toBlob(dataUrl);
        const file = new File([blob], `${player.playerName}-game${gameNumStr}.png`, { type: "image/png" });
        try {
          await navigator.share({ files: [file], title: `${player.playerName} — Game ${gameNumStr}`, url: pageUrl });
        } catch {
          downloadDataUrl(dataUrl, pageUrl);
        }
        setSharing(false);
      } else {
        downloadDataUrl(dataUrl, pageUrl);
        setSharing(false);
      }
    } catch (e) {
      console.error(e);
      setSharing(false);
    }
  };

  const downloadDataUrl = (dataUrl: string, url: string) => {
    const link = document.createElement("a");
    link.download = `${player.playerName}-game${gameNumStr}.png`;
    link.href = dataUrl;
    link.click();

    // Copy URL to clipboard
    navigator.clipboard.writeText(url).then(() => {
      setShareMsg("Image downloaded · link copied!");
    }).catch(() => {
      setShareMsg("Image downloaded");
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <Navigation />

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back link */}
        <div className="mb-5">
          <Link
            href={`/games/${gameNumStr}?season=${encodeURIComponent(seasonParam)}`}
            className="text-gray-500 hover:text-white text-sm transition-colors"
          >
            ← Game {gameNumStr} Box Score
          </Link>
        </div>

        {/* Main card — ref for screenshot */}
        <div ref={cardRef} className="bg-[#161616] rounded-2xl overflow-hidden border border-white/5">

          {/* Header strip */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${teamColor} flex items-center justify-center font-bold text-lg`}>
                {player.playerName?.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-white text-lg leading-tight">
                  {player.playerId ? (
                    <Link href={`/players/${player.playerId}`} className="hover:text-orange-400 transition-colors">
                      {player.playerName}
                    </Link>
                  ) : player.playerName}
                </div>
                <div className="text-gray-500 text-xs">{isTeam1 ? game.team1 : game.team2}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-semibold ${won ? "text-green-400" : "text-red-400"}`}>
                {won ? "W" : "L"} {myScore}–{oppScore}
              </div>
              <div className="text-gray-600 text-xs">vs {oppTeam}</div>
              <div className="text-gray-600 text-xs mt-0.5">{game.date}</div>
            </div>
          </div>

          {/* Big 3 stats */}
          <div className="flex items-end gap-2 px-5 pb-4 pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-white leading-none">{fmt(player.points)}</span>
              <span className="text-gray-500 text-sm font-medium mb-1">pts</span>
            </div>
            <div className="text-gray-700 text-3xl font-thin mb-1">/</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white leading-none">{fmt(player.rebounds)}</span>
              <span className="text-gray-500 text-xs mb-0.5">reb</span>
            </div>
            <div className="text-gray-700 text-3xl font-thin mb-1">/</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white leading-none">{fmt(player.assists)}</span>
              <span className="text-gray-500 text-xs mb-0.5">ast</span>
            </div>
          </div>

          {/* Badges with tooltips */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-5 pb-4">
              {badges.map((b) => (
                <span
                  key={b}
                  title={BADGE_DESCRIPTIONS[b]}
                  className="relative text-[10px] uppercase tracking-[0.18em] bg-white/8 border border-white/10 text-gray-300 px-2 py-1 rounded-full cursor-default group"
                >
                  {b}
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded bg-zinc-800 border border-white/10 px-2 py-1 text-[10px] normal-case tracking-normal text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {BADGE_DESCRIPTIONS[b]}
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-white/5 mx-5" />

          {/* Stat grid */}
          <div className="px-5 py-4 grid grid-cols-4 gap-y-4">
            {[
              { label: "FGM", val: fmt(player.fgm) },
              { label: "FGA", val: fmt(player.fga) },
              { label: "FG%", val: pct(player.fgPercentage) },
              { label: "MIN", val: fmt(player.minutes) },

              { label: "3PM", val: fmt(player.threePM) },
              { label: "3PA", val: fmt(player.threePA) },
              { label: "3P%", val: pct(player.threePPercentage) },
              { label: "STL", val: fmt(player.steals) },

              { label: "FTM", val: fmt(player.ftm) },
              { label: "FTA", val: fmt(player.fta) },
              { label: "FT%", val: player.fta === 0 ? "—" : pct(player.ftPercentage) },
              { label: "BLK", val: fmt(player.blocks) },

              { label: "TOV", val: fmt(player.turnovers || 0) },
              { label: "EFF", val: efficiency.toFixed(0) },
              { label: "SCORE", val: player.playerScore?.toFixed(1) || "—" },
              { label: "", val: "" },
            ].map((s, i) =>
              s.label ? (
                <div key={i} className="text-center">
                  <div className="text-white font-semibold text-base">{s.val}</div>
                  <div className="text-gray-600 text-[10px] uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ) : <div key={i} />
            )}
          </div>

          {/* Game score footer */}
          <div className="border-t border-white/5 mx-5" />
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-gray-600 text-xs">Game {gameNumStr} · {seasonParam}</span>
            <Link
              href={`/games/${gameNumStr}?season=${encodeURIComponent(seasonParam)}`}
              className="text-orange-400 text-xs hover:text-orange-300 transition-colors"
            >
              Full box score →
            </Link>
          </div>
        </div>

        {/* Share button */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors disabled:opacity-50"
          >
            {sharing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
                Share
              </>
            )}
          </button>
          {shareMsg && <p className="text-gray-500 text-xs">{shareMsg}</p>}
        </div>

        {/* Shot log */}
        {(shots.length > 0 || highlights.length > 0) && (
          <div className="mt-6 bg-[#161616] rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Shot Log</h3>
            </div>
            <div className="divide-y divide-white/5">
              {[
                ...shots.map(s => ({ kind: 'shot' as const, timestamp: s.timestamp, made: s.made, label: describeShotLabel(s) })),
                ...highlights.map(h => ({ kind: 'highlight' as const, timestamp: h.timestamp, type: h.type, description: h.description })),
              ].map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 text-sm">
                  {entry.kind === 'shot' ? (
                    <>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.made ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-gray-500 w-16 flex-shrink-0 text-xs">{entry.timestamp || '—'}</span>
                      <span className={`w-12 flex-shrink-0 font-medium ${entry.made ? 'text-green-400' : 'text-red-400'}`}>{entry.made ? 'Made' : 'Miss'}</span>
                      <span className="text-gray-200">{entry.label}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full flex-shrink-0 bg-orange-400" />
                      <span className="text-gray-500 w-16 flex-shrink-0 text-xs">{entry.timestamp || '—'}</span>
                      <span className="text-orange-300 w-12 flex-shrink-0 font-medium capitalize">{entry.type!.replace(/-/g, ' ')}</span>
                      <span className="text-gray-200">{entry.description}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
