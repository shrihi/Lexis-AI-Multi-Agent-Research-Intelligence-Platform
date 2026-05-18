'use client';

interface LoadingOrbProps {
  active?: boolean;
  label?: string;
}

export default function LoadingOrb({
  active = true,
  label,
}: LoadingOrbProps) {
  if (!active) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />

      {label && (
        <span className="text-secondary text-sm">
          {label}
        </span>
      )}
    </div>
  );
}