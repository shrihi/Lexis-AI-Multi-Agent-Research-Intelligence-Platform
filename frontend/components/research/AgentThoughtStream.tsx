'use client';

import { useEffect, useRef, useState } from 'react';
import { AgentThought } from '@/lib/types';

interface AgentThoughtStreamProps {
  sessionId: string;
}

export default function AgentThoughtStream({
  sessionId,
}: AgentThoughtStreamProps) {
  const [thoughts, setThoughts] = useState<AgentThought[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/research/stream/${sessionId}`
    );

    eventSource.onmessage = (event) => {
      try {
        const thought: AgentThought = JSON.parse(event.data);

        setThoughts((prev) => [...prev, thought]);

        if (
          thought.type === 'complete' ||
          thought.type === 'error'
        ) {
          eventSource.close();
          setIsConnected(false);
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [sessionId]);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
    });
  }, [thoughts]);

  return (
    <div
      className="bg-surface rounded-lg border border-border p-4 h-[500px] overflow-y-auto font-mono text-sm"
      ref={containerRef}
    >
      <div className="space-y-2">
        {thoughts.map((thought, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-accent-green font-bold shrink-0">
              [{thought.agent}]
            </span>

            <span
              className={
                thought.type === 'error'
                  ? 'text-accent-red'
                  : 'text-text'
              }
            >
              {thought.message}
            </span>
          </div>
        ))}

        {isConnected && (
          <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}