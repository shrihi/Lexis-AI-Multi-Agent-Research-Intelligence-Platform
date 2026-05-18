'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AgentThoughtStream from '@/components/research/AgentThoughtStream';
import { useSessionStore } from '@/lib/store';

function ResearchConsole() {
  const router = useRouter();
  const params = useSearchParams();
  const setActiveSessionId = useSessionStore((s) => s.setActiveSessionId);

  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState(3);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);

  const startResearch = async (q: string, d: number) => {
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/research/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: q,
            depth: d,
          }),
        }
      );

      if (!resp.ok) {
        throw new Error('Failed to start research');
      }

      const data = await resp.json();

      setSessionId(data.session_id);
      setActiveSessionId(data.session_id);
    } catch (err) {
      console.error('Failed to start research:', err);
    }
  };

  // Auto-start research when redirected with query params
  useEffect(() => {
    if (autoStarted) return;

    const q = params?.get('q') || params?.get('query');
    const d = parseInt(params?.get('depth') || '3');

    if (q) {
      setAutoStarted(true);

      // Set state first
      setQuery(q);
      setDepth(d);

      // Delay API call slightly to allow hydration/state updates
      setTimeout(() => {
        startResearch(q, d);
      }, 100);
    }
  }, [params, autoStarted]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    await startResearch(query, depth);
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
                htmlFor="query"
                className="block text-sm font-medium text-text mb-1"
              >
                Research Question
              </label>

              <input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your research question..."
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:border-accent-blue"
              />
            </div>

            <div>
              <label
                htmlFor="depth"
                className="block text-sm font-medium text-text mb-1"
              >
                Depth (1-5)
              </label>

              <input
                id="depth"
                type="number"
                min={1}
                max={5}
                value={depth}
                onChange={(e) => setDepth(parseInt(e.target.value) || 3)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:border-accent-blue"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-accent-green py-2 text-primary transition hover:bg-accent-green/80"
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
              onComplete={() => setIsComplete(true)}
            />

            {isComplete && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push(`/research/${sessionId}`)}
                  className="rounded-md bg-accent-blue px-6 py-2 text-primary transition hover:bg-accent-blue/80"
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

        if (!resp.ok) {
          setTimeout(check, 2000);
          return;
        }

        const data = await resp.json();

        if (
          (data.status === 'complete' || data.status === 'error') &&
          !cancelled
        ) {
          onComplete();
        } else if (!cancelled) {
          setTimeout(check, 2000);
        }
      } catch (err) {
        console.error('Polling error:', err);

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

export default function ResearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-main py-12 text-text">
          Loading...
        </div>
      }
    >
      <ResearchConsole />
    </Suspense>
  );
}