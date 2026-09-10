import { useEffect, useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface EmergencyToastProps {
  message: string;
  channel: string;
  onClose: () => void;
}

export default function EmergencyToast({ message, channel, onClose }: EmergencyToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Slide in
    const showTimer = setTimeout(() => setVisible(true), 10);

    // Auto-dismiss after 6 seconds
    const dismissTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 350);
    }, 6000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [onClose]);

  function handleClose() {
    setExiting(true);
    setTimeout(onClose, 350);
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        maxWidth: 380,
        width: '90vw',
        transform: visible && !exiting ? 'translateX(0) scale(1)' : 'translateX(110%) scale(0.95)',
        opacity: visible && !exiting ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease',
        background: 'linear-gradient(135deg, rgba(22,163,74,0.12) 0%, rgba(16,185,129,0.08) 100%)',
        border: '1px solid rgba(22,163,74,0.35)',
        borderRadius: 14,
        padding: '14px 16px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(22,163,74,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(22,163,74,0.15)',
            border: '1px solid rgba(22,163,74,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#16a34a',
              marginBottom: 3,
              fontFamily: 'monospace',
            }}
          >
            ✓ Alert Broadcast Sent · {channel}
          </div>
          <div
            style={{
              fontSize: 13,
              color: '#e5e7eb',
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {message}
          </div>
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            flexShrink: 0,
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: 6,
            padding: 4,
            cursor: 'pointer',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Progress bar */}
      <div
        style={{
          marginTop: 10,
          height: 2,
          borderRadius: 999,
          background: 'rgba(22,163,74,0.15)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: '#16a34a',
            borderRadius: 999,
            animation: 'toast-progress 6s linear forwards',
          }}
        />
      </div>
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
