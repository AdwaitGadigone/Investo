"use client";

import { useRef } from "react";
import { selectGuildAction } from "@/lib/actions/guild";

// Only rendered by AppNav when there's more than one mutual server to pick from.
export function ServerSwitcher({ guilds, activeGuildId, className = "" }) {
  const formRef = useRef(null);

  return (
    <form ref={formRef} action={selectGuildAction} className={className}>
      <select
        name="guildId"
        defaultValue={activeGuildId ?? guilds[0]?.id}
        onChange={() => formRef.current?.requestSubmit()}
        className="bg-transparent text-sm text-text-muted hover:text-text border border-border rounded-full pl-3 pr-2 py-1.5 focus:outline-none focus:border-discord transition-colors cursor-pointer max-w-[140px] truncate"
      >
        {guilds.map((guild) => (
          <option key={guild.id} value={guild.id} className="bg-surface text-text">
            {guild.name}
          </option>
        ))}
      </select>
    </form>
  );
}
