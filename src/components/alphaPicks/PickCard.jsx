import React from 'react';

const STATUS_CONFIG = {
  buy_zone: { label: 'Buy zone', bg: '#EAF3DE', color: '#3B6D11' },
  watch:    { label: 'Watch',    bg: '#FAEEDA', color: '#854F0B' },
  avoid:    { label: 'Avoid',    bg: '#FCEBEB', color: '#A32D2D' },
};

export function PickCard({ pick, isActive, onClick, onAddToWatchlist }) {
  const s = STATUS_CONFIG[pick.status] || STATUS_CONFIG.watch;
  return (
    <div
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: 240,
        background: '#FAFAF8',
        border: isActive ? '1.5px solid #185FA5' : '0.5px solid #E5E0D5',
        borderRadius: 10,
        padding: '10px 12px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Row 1: Asset + type badge + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0F1F3D' }}>{pick.displayName}</span>
          <span style={{
            fontSize: 9, padding: '1px 5px', borderRadius: 8,
            background: pick.type === 'tracked' ? '#E6F1FB' : '#EEEDFE',
            color: pick.type === 'tracked' ? '#0C447C' : '#3C3489',
            fontWeight: 500,
          }}>
            {pick.type === 'tracked' ? '● Tracked' : '◆ New'}
          </span>
        </div>
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: s.bg, color: s.color, fontWeight: 500 }}>
          {s.label}
        </span>
      </div>

      {/* Row 2: Current price */}
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
        ${pick.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      </div>

      {/* Row 3: Entry zone */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#6B7280' }}>Entry zone</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: '#0F1F3D' }}>
          ${pick.entryZoneLow.toFixed(0)} – ${pick.entryZoneHigh.toFixed(0)}
        </span>
      </div>

      {/* Row 4: Upside / downside */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, background: '#EAF3DE', borderRadius: 6, padding: '4px 6px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3B6D11' }}>+{pick.upsidePercent.toFixed(1)}%</div>
          <div style={{ fontSize: 9, color: '#3B6D11' }}>${pick.upsideTarget.toFixed(0)}</div>
        </div>
        <div style={{ flex: 1, background: '#FCEBEB', borderRadius: 6, padding: '4px 6px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#A32D2D' }}>{pick.downsidePercent.toFixed(1)}%</div>
          <div style={{ fontSize: 9, color: '#A32D2D' }}>${pick.downsideStop.toFixed(0)}</div>
        </div>
      </div>

      {/* Row 5: Horizon + reason */}
      <div style={{ fontSize: 10, color: '#6B7280', borderTop: '0.5px solid #E5E0D5', paddingTop: 6 }}>
        <span style={{ fontWeight: 600, color: '#0F1F3D', marginRight: 4 }}>{pick.horizon}</span>
        {pick.reason}
      </div>

      {/* Row 6: Add to watchlist (discovery only) */}
      {pick.type === 'discovery' && onAddToWatchlist && (
        <button
          onClick={e => { e.stopPropagation(); onAddToWatchlist(pick.asset); }}
          style={{
            marginTop: 8, width: '100%', padding: '5px 0', borderRadius: 6,
            border: '0.5px solid #E5E0D5', background: 'transparent',
            fontSize: 10, fontWeight: 500, color: '#6B7280', cursor: 'pointer',
          }}
        >
          + Add to watchlist
        </button>
      )}
    </div>
  );
}
