'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AgentThoughtStream from '@/components/research/AgentThoughtStream';
import { useSessionStore } from '@/lib/store';

export default function ResearchPage() {
  const router = useRouter();
  const setActiveSessionId = useSessionStore((s) => s.setActiveSessionId);

  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState(3);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/research/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, depth }),
        }
      );

      const data = await resp.json();
      const id = data.session_id;

      setSessionId(id);
      setActiveSessionId(id);
    } catch (err) {
      console.error('Failed to start research', err);
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
  };

  return (
    <main className="container-main py-12">
      <section className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-accent-green mb-6 text-center">
          Research Console
        </h1>

        {!sessionId && (
          <form onSubmit={handleStart} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-text mb-1"
                htmlFor="query"
              >
                Research Question
              </label>

              <input
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:border-accent-blue"
                placeholder="Enter your research question..."
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-text mb-1"
                htmlFor="depth"
              >
                Depth (1-5)
              </label>

              <input
                id="depth"
                type="number"
                min={1}
                max={5}
                value={depth}
                onChange={(e) =>
                  setDepth(parseInt(e.target.value) || 3)
                }
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:border-accent-blue"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent-green text-primary py-2 rounded hover:bg-accent-green/80"
            >
              Start Research
            </button>
          </form>
        )}

        {sessionId && (
          <div className="mt-8">
            <AgentThoughtStream sessionId={sessionId} />

            <CompletionWatcher
              sessionId={sessionId}
              onComplete={handleComplete}
            />

            {isComplete && (
              <div className="mt-4 text-center">
                <button
                  onClick={() =>
                    router.push(`/research/${sessionId}`)
                  }
                  className="px-6 py-2 bg-accent-blue text-primary rounded"
                >
                  View Report →
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function CompletionWatcher({
  sessionId,
  onComplete,
}: {
  sessionId: string;
  onComplete: () => void;
}) {
  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const resp = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/research/report/${sessionId}`
        );

        if (!resp.ok) return;

        const data = await resp.json();

        if (
          (data.status === 'complete' ||
            data.status === 'error') &&
          !cancelled
        ) {
          onComplete();
        } else if (!cancelled) {
          setTimeout(check, 2000);
        }
      } catch {
        if (!cancelled) {
          setTimeout(check, 3000);
        }
      }
    };

    check();

    return () => {
      cancelled = true;
    };
  }, [sessionId, onComplete]);

  return null;
}