// Soft, blurred color shapes anchored toward the edges of a section, not a centered glow
// behind text (that's the generic-AI-app move). Different variants so each section down
// the page has its own quiet bit of color instead of the whole site reusing one spot.
const VARIANTS = {
  hero: [
    "absolute -top-32 -right-40 h-[420px] w-[420px] rounded-full bg-discord/25 blur-[110px]",
    "absolute top-1/3 -left-32 h-[320px] w-[320px] rounded-full bg-warm/20 blur-[100px]",
    "absolute bottom-0 right-1/4 h-[280px] w-[280px] rounded-full bg-cool/20 blur-[100px]",
  ],
  steps: [
    "absolute -top-20 left-1/4 h-[300px] w-[300px] rounded-full bg-cool/15 blur-[100px]",
    "absolute bottom-0 -right-24 h-[260px] w-[260px] rounded-full bg-discord/15 blur-[90px]",
  ],
  features: [
    "absolute top-0 -left-24 h-[320px] w-[320px] rounded-full bg-warm/15 blur-[110px]",
    "absolute -bottom-24 right-1/3 h-[280px] w-[280px] rounded-full bg-discord/15 blur-[100px]",
  ],
  cta: [
    "absolute -top-24 left-1/2 -translate-x-1/2 h-[360px] w-[500px] rounded-full bg-cool/15 blur-[120px]",
  ],
};

export function GradientBlobs({ variant = "hero" }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      {VARIANTS[variant].map((cls, i) => (
        <div key={i} className={cls} />
      ))}
    </div>
  );
}
