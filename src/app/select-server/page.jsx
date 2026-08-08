import { redirect } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { getAvailableGuilds } from "@/lib/auth/active-guild";
import { selectGuildAction } from "@/lib/actions/guild";

export default async function SelectServerPage() {
  const guilds = await getAvailableGuilds();

  // Nothing cached, most likely a stale/expired cookie, a fresh login rebuilds the list.
  if (guilds.length === 0) redirect("/login");

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <Wordmark className="text-3xl mb-8" />
      <h1 className="font-display text-3xl font-bold tracking-tight mb-3">
        Which server?
      </h1>
      <p className="text-text-muted max-w-sm mb-8">
        Investo's in more than one server you're a member of. Pick which one to view,
        switch anytime from the menu once you're in.
      </p>
      <div className="grid gap-3 w-full max-w-sm">
        {guilds.map((guild) => (
          <form key={guild.id} action={selectGuildAction}>
            <input type="hidden" name="guildId" value={guild.id} />
            <button
              type="submit"
              className="w-full flex items-center gap-3 glass rounded-lg px-4 py-3 text-left hover:border-discord transition-colors"
            >
              {guild.icon ? (
                <img src={guild.icon} alt="" width={32} height={32} className="rounded-full shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface-2 shrink-0" />
              )}
              <span className="font-semibold truncate">{guild.name}</span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
