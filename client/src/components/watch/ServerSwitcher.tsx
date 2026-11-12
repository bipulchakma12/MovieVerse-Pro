'use client';

import type { StreamServer, StreamServerId } from '@/utils/streamServers';

interface ServerSwitcherProps {
  servers: StreamServer[];
  active: StreamServerId;
  onChange: (id: StreamServerId) => void;
}

export default function ServerSwitcher({ servers, active, onChange }: ServerSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="Streaming server"
      className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold"
    >
      <span className="px-2 text-slate-400">Server:</span>
      {servers.map((server) => (
        <button
          key={server.id}
          onClick={() => onChange(server.id)}
          aria-pressed={active === server.id}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            active === server.id
              ? 'bg-[#00e054] text-black font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {server.label}
        </button>
      ))}
    </div>
  );
}
