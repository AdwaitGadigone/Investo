import { Wordmark } from "@/components/wordmark";

export default function UnauthorizedPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <Wordmark className="text-3xl mb-8" />
      <h1 className="font-display text-3xl font-bold tracking-tight mb-3">
        Not in the server
      </h1>
      <p className="text-text-muted max-w-sm">
        Your Discord account signed in fine, but it isn&apos;t a member of the server
        Investo runs in, so there&apos;s nothing here for it yet.
      </p>
    </div>
  );
}
