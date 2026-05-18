import { useState } from 'react';

interface ContradictionAlertProps {
  contradiction: {
    claim_a: string;
    claim_b: string;
    source_a: string;
    source_b: string;
    explanation: string;
  };
}

export default function ContradictionAlert({
  contradiction,
}: ContradictionAlertProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="border-l-4 border-accent-amber bg-surface rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 flex flex-col items-start">
          <div className="font-medium text-sm text-accent-blue">
            Claim A
          </div>

          <div className="text-sm text-text mb-2">
            {contradiction.claim_a}
          </div>

          <div className="text-xs text-muted">
            Source: {contradiction.source_a}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-start">
          <div className="font-medium text-sm text-accent-blue">
            Claim B
          </div>

          <div className="text-sm text-text mb-2">
            {contradiction.claim_b}
          </div>

          <div className="text-xs text-muted">
            Source: {contradiction.source_b}
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="text-accent-red hover:text-accent-red/80 text-lg font-bold"
          aria-label="Close contradiction alert"
        >
          ×
        </button>
      </div>

      <div className="text-xs text-accent-amber font-medium mb-1">
        ⚠ Contradiction Detected
      </div>

      <p className="text-sm text-text">
        {contradiction.explanation.replace(/\n/g, ' • ')}
      </p>
    </div>
  );
}