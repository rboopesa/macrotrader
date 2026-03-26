import React, { useState } from 'react';

/**
 * AnalysisPanel — collapsible reasoning panel below the left chart.
 *
 * Props:
 *   signal  — buildSignal output object (score, action, rsi, rsiLabel, macd,
 *             macdLabel, emaLabel, e20, e50, cur, entry, stop, target,
 *             expRet, expDD, rr, winRate, grade, contextScore)
 *   asset   — string label for the asset
 */

const C = {
  navy: '#0F1F3D',
  green: '#059669', greenBg: '#ECFDF5',
  red: '#DC2626',   redBg:   '#FEF2F2',
  amber: '#D97706', amberBg: '#FFFBEB',
  blue: '#1D4ED8',  blueBg:  '#EFF6FF',
  border: '#E5E0D5',
  panel: '#F8F7F4',
  muted: '#78716C',
  text: '#1C1917',
  textMid: '#44403C',
};

const MONO = "'JetBrains Mono','Fira Code',monospace";

// ── helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 66) return C.green;
  if (score >= 50) return C.amber;
  return C.red;
}

function SectionHeader({ title, open, onToggle, accent }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        padding: '8px 12px', borderBottom: `0.5px solid ${C.border}`,
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: accent || C.navy, letterSpacing: '0.02em' }}>
        {title}
      </span>
      <span style={{ fontSize: 14, color: C.muted, lineHeight: 1 }}>{open ? '−' : '+'}</span>
    </button>
  );
}

function Row({ label, value, valueColor, mono }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '5px 12px', borderBottom: `0.5px solid ${C.border}`,
      fontSize: 11,
    }}>
      <span style={{ color: C.muted }}>{label}</span>
      <span style={{
        color: valueColor || C.text, fontWeight: 600,
        fontFamily: mono ? MONO : undefined,
      }}>{value ?? '—'}</span>
    </div>
  );
}

function Badge({ label, color, bg }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 10, fontWeight: 700,
      padding: '2px 8px', borderRadius: 10,
      color: color, background: bg, marginRight: 4, marginBottom: 4,
    }}>{label}</span>
  );
}

// ── Section 1 — Why this recommendation ──────────────────────────────────────

function WhySection({ signal }) {
  const [open, setOpen] = useState(true);
  if (!signal) return null;

  const { score, action, grade, rsi, rsiLabel, macdLabel, emaLabel, contextScore } = signal;
  const ac = scoreColor(score);

  const bullets = [];
  if (rsi < 30)       bullets.push({ text: `RSI at ${rsi?.toFixed(1)} — deep oversold zone signals potential reversal`, sentiment: 'positive' });
  else if (rsi > 70)  bullets.push({ text: `RSI at ${rsi?.toFixed(1)} — overbought; momentum may be exhausted`, sentiment: 'negative' });
  else                bullets.push({ text: `RSI at ${rsi?.toFixed(1)} — ${rsiLabel}`, sentiment: 'neutral' });

  if (macdLabel?.includes('^')) bullets.push({ text: `MACD: ${macdLabel} — trend momentum supports the bias`, sentiment: 'positive' });
  else if (macdLabel?.includes('v')) bullets.push({ text: `MACD: ${macdLabel} — trend momentum is against the bias`, sentiment: 'negative' });
  else bullets.push({ text: `MACD: ${macdLabel}`, sentiment: 'neutral' });

  if (emaLabel?.includes('uptrend')) bullets.push({ text: `Price above both EMAs — structure is bullish`, sentiment: 'positive' });
  else if (emaLabel?.includes('downtrend')) bullets.push({ text: `Price below both EMAs — structure is bearish`, sentiment: 'negative' });
  else bullets.push({ text: `EMA structure: ${emaLabel}`, sentiment: 'neutral' });

  const sentColor = s => s === 'positive' ? C.green : s === 'negative' ? C.red : C.muted;

  return (
    <div>
      <SectionHeader title="WHY THIS RECOMMENDATION" open={open} onToggle={() => setOpen(o => !o)} accent={ac} />
      {open && (
        <div style={{ padding: '10px 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            padding: '8px 10px', background: ac + '12', borderRadius: 8, border: `0.5px solid ${ac}33`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', background: ac,
              fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
              fontFamily: MONO,
            }}>{score}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>
                {action} · Grade {grade}
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>
                Context confidence: {contextScore}/100
              </div>
            </div>
          </div>
          {bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 11, lineHeight: 1.5 }}>
              <span style={{ color: sentColor(b.sentiment), flexShrink: 0, marginTop: 1 }}>
                {b.sentiment === 'positive' ? '▲' : b.sentiment === 'negative' ? '▼' : '●'}
              </span>
              <span style={{ color: C.textMid }}>{b.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section 2 — Signal breakdown table ───────────────────────────────────────

function SignalBreakdown({ signal }) {
  const [open, setOpen] = useState(true);
  if (!signal) return null;

  const { score, rsi, rsiLabel, macd, macdLabel, e20, e50, cur, entry, stop, target, expRet, expDD, rr, winRate, volLabel } = signal;

  const fmt = v => v == null ? '—' : typeof v === 'number' ? (v >= 100 ? v.toFixed(0) : v.toFixed(2)) : v;

  const rsiColor = rsi < 30 ? C.green : rsi > 70 ? C.red : C.amber;
  const macdColor = macdLabel?.includes('^') ? C.green : C.red;
  const emaColor = cur > e20 && cur > e50 ? C.green : cur < e20 && cur < e50 ? C.red : C.amber;
  const rrColor = rr >= 2 ? C.green : rr >= 1 ? C.amber : C.red;
  const winColor = winRate >= 60 ? C.green : winRate >= 50 ? C.amber : C.red;

  return (
    <div>
      <SectionHeader title="SIGNAL BREAKDOWN" open={open} onToggle={() => setOpen(o => !o)} />
      {open && (
        <div style={{ paddingBottom: 4 }}>
          <Row label="RSI (14)"         value={`${fmt(rsi)} — ${rsiLabel}`}       valueColor={rsiColor} />
          <Row label="MACD"             value={macdLabel}                           valueColor={macdColor} />
          <Row label="EMA Structure"    value={`EMA20 ${fmt(e20)}  EMA50 ${fmt(e50)}`} valueColor={emaColor} mono />
          <Row label="Volume"           value={volLabel} />
          <div style={{ height: 4 }} />
          <Row label="Entry"            value={fmt(entry)}  mono />
          <Row label="Stop Loss"        value={fmt(stop)}   valueColor={C.red}   mono />
          <Row label="Target"           value={fmt(target)} valueColor={C.green} mono />
          <Row label="Expected Return"  value={`${expRet > 0 ? '+' : ''}${fmt(expRet)}%`} valueColor={expRet > 0 ? C.green : C.red} mono />
          <Row label="Max Drawdown"     value={`${fmt(expDD)}%`}                  valueColor={C.red} mono />
          <Row label="Risk / Reward"    value={`1 : ${fmt(rr)}`}                  valueColor={rrColor} mono />
          <Row label="Win Rate Est."    value={`${winRate}%`}                     valueColor={winColor} mono />
        </div>
      )}
    </div>
  );
}

// ── Section 3 — Risk factors ──────────────────────────────────────────────────

function RiskFactors({ signal }) {
  const [open, setOpen] = useState(false);
  if (!signal) return null;

  const { score, rsi, macd, cur, e20, e50, rr, winRate } = signal;
  const risks = [];

  if (rsi > 68)  risks.push({ sev: 'high',   text: 'RSI overbought — pullback risk elevated' });
  if (rsi < 32)  risks.push({ sev: 'high',   text: 'RSI oversold — short-term bounce possible but trend may persist' });
  if (rr < 1.5)  risks.push({ sev: 'high',   text: `Risk/reward of 1:${rr?.toFixed(2)} is below the recommended 1:2 minimum` });
  if (winRate < 48) risks.push({ sev: 'medium', text: `Win rate estimate of ${winRate}% is below break-even; position sizing should be conservative` });
  if (macd?.cross === 'bearish-cross') risks.push({ sev: 'high', text: 'MACD bearish cross — momentum shifting against the trade' });
  if (cur < e20 && cur < e50) risks.push({ sev: 'medium', text: 'Price below both EMAs — trend is structurally bearish' });
  if (score >= 50 && score < 66) risks.push({ sev: 'low', text: 'HOLD zone — signal is non-directional; wait for confirmation before sizing up' });
  if (risks.length === 0) risks.push({ sev: 'low', text: 'No major red flags. Standard position-sizing and stop discipline applies.' });

  const sevColor = s => s === 'high' ? C.red : s === 'medium' ? C.amber : C.green;
  const sevBg    = s => s === 'high' ? '#FEF2F2' : s === 'medium' ? '#FFFBEB' : '#ECFDF5';

  return (
    <div>
      <SectionHeader title="RISK FACTORS" open={open} onToggle={() => setOpen(o => !o)} accent={C.red} />
      {open && (
        <div style={{ padding: '10px 12px' }}>
          {risks.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '6px 8px', borderRadius: 6,
              background: sevBg(r.sev), marginBottom: 6,
              border: `0.5px solid ${sevColor(r.sev)}33`,
            }}>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 6px',
                borderRadius: 8, background: sevColor(r.sev), color: '#fff',
                flexShrink: 0, marginTop: 1, textTransform: 'uppercase',
              }}>{r.sev}</span>
              <span style={{ fontSize: 11, color: C.textMid, lineHeight: 1.5 }}>{r.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section 4 — What each indicator means ────────────────────────────────────

const INDICATOR_GLOSSARY = [
  {
    key: 'RSI',
    title: 'RSI — Relative Strength Index (14)',
    body: 'Measures momentum on a 0–100 scale. Below 30 = oversold (potential long opportunity). Above 70 = overbought (potential short or take-profit zone). Between 40–60 = neutral.',
  },
  {
    key: 'MACD',
    title: 'MACD (12, 26, 9)',
    body: 'Trend-following momentum indicator. A bullish cross (MACD line crossing above signal line) suggests upward momentum. A bearish cross signals downward momentum. Histogram = distance between MACD and signal.',
  },
  {
    key: 'EMA',
    title: 'EMA20 & EMA50 — Exponential Moving Averages',
    body: 'EMA20 tracks short-term trend; EMA50 tracks medium-term. Price above both = bullish structure. Price below both = bearish structure. Mixed = no clear directional bias.',
  },
  {
    key: 'Score',
    title: 'AI Composite Score (0–100)',
    body: 'Weighted blend of RSI (35%), MACD (40%) and EMA (25%) scores. ≥66 = BUY, ≤34 = SELL, 35–65 = HOLD. A higher score means more indicators are aligned bullishly.',
  },
  {
    key: 'RR',
    title: 'Risk / Reward Ratio',
    body: 'Ratio of potential profit to potential loss relative to the stop. A ratio of 1:2 means you risk $1 to make $2. Minimum professional standard is 1:1.5; prefer 1:2 or better.',
  },
  {
    key: 'WinRate',
    title: 'Win Rate Estimate',
    body: 'Historical probability of signals at this score level being correct. At 68% score the base win rate is ~58%. Combined with R:R, this determines your expected value per trade.',
  },
];

function GlossarySection() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});

  return (
    <div>
      <SectionHeader title="WHAT EACH INDICATOR MEANS" open={open} onToggle={() => setOpen(o => !o)} accent={C.blue} />
      {open && (
        <div style={{ padding: '8px 12px' }}>
          {INDICATOR_GLOSSARY.map(g => (
            <div key={g.key} style={{ marginBottom: 6 }}>
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [g.key]: !prev[g.key] }))}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  width: '100%', background: C.panel, border: `0.5px solid ${C.border}`,
                  borderRadius: 6, padding: '6px 8px', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{g.title}</span>
                <span style={{ fontSize: 12, color: C.muted }}>{expanded[g.key] ? '−' : '+'}</span>
              </button>
              {expanded[g.key] && (
                <div style={{
                  fontSize: 11, color: C.textMid, lineHeight: 1.6,
                  padding: '7px 10px', background: '#fff',
                  border: `0.5px solid ${C.border}`, borderTop: 'none',
                  borderRadius: '0 0 6px 6px',
                }}>
                  {g.body}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export function AnalysisPanel({ signal, asset }) {
  return (
    <div style={{
      background: '#fff',
      border: `0.5px solid ${C.border}`,
      borderRadius: 10,
      overflow: 'hidden',
      fontSize: 11,
    }}>
      {/* panel header */}
      <div style={{
        padding: '8px 12px',
        background: C.panel,
        borderBottom: `0.5px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.05em' }}>
          ANALYSIS REASONING
        </span>
        {asset && (
          <span style={{
            fontSize: 9, padding: '1px 6px', borderRadius: 8,
            background: C.navy, color: '#fff', fontWeight: 600,
          }}>{asset}</span>
        )}
        {signal && (
          <span style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700,
            color: scoreColor(signal.score),
          }}>
            Score {signal.score} · {signal.action}
          </span>
        )}
      </div>

      {!signal ? (
        <div style={{ padding: '16px 12px', color: C.muted, textAlign: 'center', fontSize: 11 }}>
          Loading signal data…
        </div>
      ) : (
        <>
          <WhySection signal={signal} />
          <SignalBreakdown signal={signal} />
          <RiskFactors signal={signal} />
          <GlossarySection />
        </>
      )}
    </div>
  );
}

export default AnalysisPanel;
