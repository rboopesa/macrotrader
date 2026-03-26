import React, { useState } from 'react';
import { PickCard } from './PickCard.jsx';

function MobilePickPill({ pick, isActive, onClick }) {
  const color = pick.status === 'buy_zone' ? '#3B6D11' : pick.status === 'watch' ? '#854F0B' : '#A32D2D';
  const bg    = pick.status === 'buy_zone' ? '#EAF3DE' : pick.status === 'watch' ? '#FAEEDA' : '#FCEBEB';
  return (
    <div
      onClick={onClick}
      style={{
        flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2,
        padding: '6px 10px', borderRadius: 20, minHeight: 44,
        border: isActive ? '1.5px solid #185FA5' : `0.5px solid ${color}44`,
        background: bg, cursor: 'pointer', minWidth: 90, justifyContent: 'center',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 500, color, whiteSpace: 'nowrap' }}>{pick.displayName}</div>
      <div style={{ fontSize: 10, color }}>+{pick.upsidePercent.toFixed(1)}% · {pick.horizon}</div>
    </div>
  );
}

export function AlphaPicks({ picks = [], selectedAsset = '', onPickSelect, isMobile = false }) {
  const [expandedPick, setExpandedPick] = useState(null);

  const handleAddToWatchlist = (asset) => {
    alert(`Added ${asset} to watchlist`);
  };

  if (isMobile) {
    return (
      <div style={{ width: '100%', padding: '8px 12px', borderBottom: '0.5px solid #E5E0D5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: '#6B7280' }}>
            Alpha picks
          </span>
          <span style={{ fontSize: 10, color: '#9CA3AF' }}>{picks.length} today</span>
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {picks.map(pick => (
            <MobilePickPill
              key={pick.id}
              pick={pick}
              isActive={pick.asset === selectedAsset}
              onClick={() => setExpandedPick(expandedPick?.id === pick.id ? null : pick)}
            />
          ))}
        </div>
        {expandedPick && (
          <div style={{ marginTop: 8, background: '#fff', border: '0.5px solid #E5E0D5', borderRadius: 10, padding: '12px 14px' }}>
            <PickCard pick={expandedPick} isActive={false} onClick={() => {}} onAddToWatchlist={handleAddToWatchlist} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={() => { onPickSelect?.(expandedPick.asset); setExpandedPick(null); }}
                style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#185FA5', color: '#fff', border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', minHeight: 44 }}
              >
                View on chart
              </button>
              <button
                onClick={() => setExpandedPick(null)}
                style={{ padding: '8px 14px', borderRadius: 8, border: '0.5px solid #E5E0D5', background: 'transparent', fontSize: 12, color: '#6B7280', cursor: 'pointer', minHeight: 44 }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop: horizontal scrollable strip
  return (
    <div style={{ width: '100%', padding: '10px 16px', borderBottom: '0.5px solid #E5E0D5', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#0F1F3D', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Alpha picks
          </span>
          <span style={{ fontSize: 10, color: '#6B7280' }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {picks.length} opportunities
          </span>
        </div>
        {picks.length > 3 && (
          <span style={{ fontSize: 10, color: '#9CA3AF' }}>Scroll →</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {picks.map(pick => (
          <PickCard
            key={pick.id}
            pick={pick}
            isActive={pick.asset === selectedAsset}
            onClick={() => onPickSelect?.(pick.asset)}
            onAddToWatchlist={handleAddToWatchlist}
          />
        ))}
      </div>
    </div>
  );
}
