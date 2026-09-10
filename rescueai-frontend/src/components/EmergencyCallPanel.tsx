import { Phone, PhoneCall, PhoneIncoming, Siren } from 'lucide-react';

const EMERGENCY_CONTACTS = [
  { number: '112', label: 'National Emergency', icon: Siren, color: '#ff3b30', bgColor: 'rgba(255,59,48,0.10)', borderColor: 'rgba(255,59,48,0.25)' },
  { number: '101', label: 'Fire Brigade', icon: PhoneCall, color: '#f97316', bgColor: 'rgba(249,115,22,0.10)', borderColor: 'rgba(249,115,22,0.25)' },
  { number: '102', label: 'Ambulance', icon: PhoneIncoming, color: '#16a34a', bgColor: 'rgba(22,163,74,0.10)', borderColor: 'rgba(22,163,74,0.25)' },
  { number: '100', label: 'Police', icon: Phone, color: '#2563eb', bgColor: 'rgba(37,99,235,0.10)', borderColor: 'rgba(37,99,235,0.25)' },
];

export default function EmergencyCallPanel() {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: 'linear-gradient(135deg, rgba(255,59,48,0.06) 0%, rgba(220,38,38,0.04) 100%)',
        border: '1px solid rgba(255,59,48,0.18)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#ff3b30', boxShadow: '0 0 6px rgba(255,59,48,0.8)' }}
          />
          <span
            className="mono-tag text-[10px] uppercase tracking-widest font-semibold"
            style={{ color: '#ff3b30' }}
          >
            Emergency Contacts
          </span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {EMERGENCY_CONTACTS.map(({ number, label, icon: Icon, color, bgColor, borderColor }) => (
          <a
            key={number}
            href={`tel:${number}`}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer no-underline"
            style={{
              background: bgColor,
              border: `1px solid ${borderColor}`,
              textDecoration: 'none',
            }}
            title={`Call ${label} (${number})`}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: bgColor, border: `1px solid ${borderColor}` }}
            >
              <Icon size={15} style={{ color }} />
            </div>
            <div
              className="font-display font-bold text-lg leading-none tabular-nums"
              style={{ color }}
            >
              {number}
            </div>
            <div
              className="mono-tag text-[9px] uppercase tracking-wider text-center leading-tight"
              style={{ color: `${color}cc` }}
            >
              {label}
            </div>
          </a>
        ))}
      </div>

      <p className="mono-tag text-[9px] text-ash-dim text-center pt-1 leading-relaxed">
        Tap to open dialer · Works directly on mobile
      </p>
    </div>
  );
}
