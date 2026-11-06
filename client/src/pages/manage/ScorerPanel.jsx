import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/api.js';
import { useScorerKey } from '../../context/ScorerKeyContext.jsx';
import { useLiveMatch } from '../../hooks/useLiveMatch.js';
import Scoreboard from '../../components/Scoreboard.jsx';
import EventBanner from '../../components/EventBanner.jsx';
import { Loading, ErrorBox } from '../../components/Feedback.jsx';
import { teamName } from '../../utils/rounds.js';

export default function ScorerPanel() {
  const key = useScorerKey();
  const { matchId } = useParams();
  const { match, setMatch, fx, error: loadError } = useLiveMatch(matchId);
  const [touches, setTouches] = useState(1);
  const [bonus, setBonus] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [customMinutes, setCustomMinutes] = useState(15);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [timerNote, setTimerNote] = useState('');

  if (loadError) return <ErrorBox message={loadError} />;
  if (!match) return <Loading />;

  const back = <Link to={`/manage/${key}/matches`} className="text-sm underline">All matches</Link>;
  if (match.status !== 'live') {
    return (
      <>
        {back}
        <Scoreboard match={match} fx={null} />
        <p className="mt-4">
          {match.status === 'finished'
            ? `Match finished. Winner: ${match.winner?.name}.`
            : 'This match has not started. Start it from the Matches tab.'}
        </p>
      </>
    );
  }

  const currentDurationMinutes = Math.round((match.timer?.halfDuration || 900) / 60);

  const updateDuration = async (mins, resetRemaining = false) => {
    setTimerNote('');
    await send('timer', {
      action: 'set_duration',
      halfDurationMinutes: mins,
      resetTimeRemaining: resetRemaining,
    });
    setTimerNote(`Updated half duration to ${mins} minutes ✓`);
    setTimeout(() => setTimerNote(''), 3000);
  };

  const adjustTime = async (seconds) => {
    setTimerNote('');
    await send('timer', { action: 'adjust_time', delta: seconds });
  };

  const resetHalf = async () => {
    if (window.confirm(`Reset timer to full ${currentDurationMinutes} minutes for Half ${match.timer?.half || 1}?`)) {
      await send('timer', { action: 'reset_half' });
    }
  };

  const hints = match.hints;
  const raider = teamName(hints.raidingTeam === 0 ? match.teamA : match.teamB);
  const doOrDie = hints.doOrDieTeam === hints.raidingTeam;
  const names = [match.teamA?.name, match.teamB?.name];

  const send = async (path, body) => {
    setBusy(true);
    setError('');
    try {
      const updated = await api.post(`/matches/${matchId}/${path}`, body, key);
      setMatch(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const recordRaid = async () => {
    await send('event', { type: 'RAID', touches, bonus: bonus && hints.bonusLine });
    setTouches(1);
    setBonus(false);
  };

  const finish = () => {
    if (window.confirm('Finish this match? The winner moves to the next round.')) send('finish');
  };

  const options = Array.from({ length: hints.defenders + 1 }, (_, i) => i);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {back}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              try {
                await api.put(`/tournaments/${match.tournament}/display`, {
                  activeScreen: 'live_match',
                  featuredMatch: matchId,
                }, key);
                alert('Big Arena Screen is now broadcasting this live match! 🚀');
              } catch (e) {
                alert(e.message);
              }
            }}
            className="rounded-lg bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 hover:bg-amber-300 transition shadow"
          >
            📺 Broadcast This Match on /screen
          </button>
          <a
            href="/screen"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-slate-900 text-white font-bold text-xs px-3 py-1.5 hover:bg-slate-800 transition"
          >
            Open /screen ↗
          </a>
        </div>
      </div>

      <div className="mt-1">
        <Scoreboard match={match} fx={fx} />
        <EventBanner fx={fx} names={names} />
      </div>

      {/* Timer Controls */}
      {match.status === 'live' && (
        <section className="panel mb-3 border-2 border-amber-400/40 bg-amber-50/20" aria-label="Timer controls">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-display text-lg font-black text-slate-900">
                ⏱ Half {match.timer?.half || 1} ({currentDurationMinutes} Min)
              </span>
              <span className={`ml-2 inline-block px-2 py-0.5 rounded text-xs font-black ${
                match.timer?.isPaused ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {match.timer?.isPaused ? '⏸ PAUSED' : '▶ RUNNING'}
              </span>
              {match.timer?.halfTimeScoreA !== null && match.timer?.halfTimeScoreA !== undefined && (
                <span className="text-sm font-bold text-slate-600 ml-3">
                  HT Score: {match.timer.halfTimeScoreA} - {match.timer.halfTimeScoreB}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {match.timer?.isPaused ? (
                <button
                  className="rounded-lg bg-emerald-700 text-white font-black text-sm px-4 py-2 hover:bg-emerald-600 shadow transition flex items-center gap-1.5"
                  disabled={busy}
                  onClick={() => send('timer', { action: match.timer?.timerStartedAt ? 'resume' : 'start' })}
                >
                  ▶ {match.timer?.timeRemaining < (match.timer?.halfDuration || 900) ? 'Resume' : 'Start'} Timer
                </button>
              ) : (
                <button
                  className="rounded-lg bg-red-600 text-white font-black text-sm px-4 py-2 hover:bg-red-500 shadow transition flex items-center gap-1.5"
                  disabled={busy}
                  onClick={() => send('timer', { action: 'pause' })}
                >
                  ⏸ Pause Timer
                </button>
              )}

              {match.timer?.half === 1 && (
                <button
                  className="rounded-lg bg-slate-900 text-white font-bold text-sm px-3.5 py-2 hover:bg-slate-800 transition"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm('Switch to Half 2? This will save halftime scores.')) send('half');
                  }}
                >
                  Half Time →
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowTimerSettings(!showTimerSettings)}
                className="rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-100 transition shadow-sm"
              >
                ⚙️ {showTimerSettings ? 'Close Settings' : 'Change 15m / 20m Duration'}
              </button>
            </div>
          </div>

          {/* Quick Time Adjustment & Duration Selector */}
          <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Quick Adjustment (+1m, -1m, Reset) */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500 uppercase">Adjust Remaining:</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => adjustTime(60)}
                className="rounded bg-slate-200 hover:bg-slate-300 px-2.5 py-1 font-bold text-slate-800"
                title="Add 1 minute"
              >
                +1 Min
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => adjustTime(-60)}
                className="rounded bg-slate-200 hover:bg-slate-300 px-2.5 py-1 font-bold text-slate-800"
                title="Subtract 1 minute"
              >
                -1 Min
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={resetHalf}
                className="rounded bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 font-bold border border-amber-300"
                title="Reset timer to full half"
              >
                🔄 Reset Half Time
              </button>
            </div>

            {timerNote && (
              <span className="rounded bg-emerald-100 text-emerald-800 px-2.5 py-0.5 font-bold border border-emerald-300 anim-bump">
                {timerNote}
              </span>
            )}
          </div>

          {/* Collapsible Duration Editor */}
          {showTimerSettings && (
            <div className="mt-3 p-3.5 rounded-xl bg-white border border-slate-300 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-black text-xs uppercase tracking-wider text-slate-700 block">
                    Change Match Duration (मैच का समय बदलें):
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Current: <strong>{currentDurationMinutes} min per half</strong>. Quick select 15 min or 20 min below:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy || currentDurationMinutes === 15}
                    onClick={() => updateDuration(15, match.timer?.isPaused)}
                    className={`rounded-lg px-3 py-1.5 font-black text-xs transition ${
                      currentDurationMinutes === 15
                        ? 'bg-amber-400 text-slate-950 font-black shadow'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border'
                    }`}
                  >
                    ⏱ 15 Minutes
                  </button>
                  <button
                    type="button"
                    disabled={busy || currentDurationMinutes === 20}
                    onClick={() => updateDuration(20, match.timer?.isPaused)}
                    className={`rounded-lg px-3 py-1.5 font-black text-xs transition ${
                      currentDurationMinutes === 20
                        ? 'bg-amber-400 text-slate-950 font-black shadow'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border'
                    }`}
                  >
                    ⏱ 20 Minutes
                  </button>
                  <button
                    type="button"
                    disabled={busy || currentDurationMinutes === 10}
                    onClick={() => updateDuration(10, match.timer?.isPaused)}
                    className={`rounded-lg px-3 py-1.5 font-black text-xs transition ${
                      currentDurationMinutes === 10
                        ? 'bg-amber-400 text-slate-950 font-black shadow'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border'
                    }`}
                  >
                    ⏱ 10 Minutes
                  </button>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      className="w-16 rounded border px-2 py-1 text-xs font-bold"
                      placeholder="Min"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => updateDuration(Number(customMinutes), match.timer?.isPaused)}
                      className="rounded bg-slate-900 text-white px-2.5 py-1 text-xs font-bold hover:bg-slate-800"
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="panel" aria-label="Raid controls">
        <h2 className="text-xl">{raider} is raiding</h2>
        {doOrDie && <p className="mt-1 font-medium text-alert">Do or die: the raider must score or is out.</p>}

        <p className="mt-4 text-sm font-medium">Defenders touched</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {options.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setTouches(n)}
              aria-pressed={touches === n}
              className={`h-12 w-12 rounded-lg border font-display text-xl ${touches === n ? 'border-ink bg-ink text-white' : 'border-ink/20 bg-white'}`}
            >
              {n}
            </button>
          ))}
        </div>

        <label className={`mt-4 flex items-center gap-2 ${hints.bonusLine ? '' : 'opacity-50'}`}>
          <input type="checkbox" className="h-5 w-5" checked={bonus && hints.bonusLine} disabled={!hints.bonusLine} onChange={(e) => setBonus(e.target.checked)} />
          Bonus point {hints.bonusLine ? '' : '(needs 6 or 7 defenders)'}
        </label>

        <button className="btn-dark mt-4 w-full py-3 text-lg" disabled={busy || (touches === 0 && !(bonus && hints.bonusLine))} onClick={recordRaid}>
          Record raid
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button className="btn-light py-3" disabled={busy} onClick={() => send('event', { type: 'TACKLE' })}>
            {hints.superTackle ? 'Super tackle (+2)' : 'Tackle (+1)'}
          </button>
          <button className={`py-3 ${doOrDie ? 'btn-danger' : 'btn-light'}`} disabled={busy} onClick={() => send('event', { type: 'EMPTY' })}>
            {doOrDie ? 'Raider out (do or die)' : 'Empty raid'}
          </button>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button className="btn-light" disabled={busy} onClick={() => send('undo')}>Undo last</button>
        <button className="btn-dark" disabled={busy} onClick={finish}>Finish match</button>
      </div>
      <div className="mt-3"><ErrorBox message={error} /></div>

      <h2 className="mb-2 mt-8 text-xl">Log</h2>
      <ol className="panel space-y-1 text-sm">
        {[...match.log].reverse().slice(0, 8).map((l, i) => <li key={`${l.at}-${i}`}>{l.text}</li>)}
      </ol>
    </>
  );
}
