'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      router.push(`/research?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <main className="container-main py-12">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden mb-20"
        style={{ minHeight: '60vh' }}
      >
        {/* Blobs */}
        <div className="blob blob1" />
        <div className="blob blob2" />

        <div className="text-center pt-20">
          <h1 className="text-5xl md:text-6xl font-bold text-accent-green mb-4">
            Research Intelligence
            <br />
            Powered by Multi-Agent AI
          </h1>

          <p className="text-xl text-secondary mb-8">
            Ask any question and watch Lexis synthesize answers with confidence
            scores.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex justify-center"
          >
            <div className="flex items-center bg-surface border border-border rounded px-4 py-2 w-full max-w-2xl">
              <span className="text-accent-green mr-2">&gt;</span>

              <input
                type="text"
                placeholder="Enter your research question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-text placeholder:text-secondary"
              />

              <button
                type="submit"
                className="ml-4 bg-accent-green text-primary px-4 py-2 rounded hover:bg-accent-green/80"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-accent-green mb-8 text-center">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Plan',
              description: 'The query is broken into sub-questions.',
            },
            {
              title: 'Search',
              description:
                'Tavily searches the web for each sub-question.',
            },
            {
              title: 'Synthesize',
              description:
                'Claude generates claims with confidence scores.',
            },
            {
              title: 'Critique',
              description:
                'Contradictions are detected and resolved.',
            },
            {
              title: 'Report',
              description:
                'A markdown report is streamed to the UI.',
            },
            {
              title: 'Remember',
              description:
                'Results are stored in Chroma vector memory.',
            },
          ].map((step, i) => (
            <div
              key={i}
              className="bg-surface p-6 rounded border border-border"
            >
              <h3 className="text-xl font-semibold text-accent-green mb-2">
                {step.title}
              </h3>

              <p className="text-text">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section>
        <h2 className="text-3xl font-bold text-accent-green mb-8 text-center">
          Features
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Model Routing',
              desc: 'Cheap models for planning, powerful models for synthesis.',
            },
            {
              title: 'Persistent Memory',
              desc: 'Semantic vector store remembers past sessions.',
            },
            {
              title: 'Contradiction Detection',
              desc:
                'Automated confidence scoring & conflict resolution.',
            },
            {
              title: 'Observable Traces',
              desc:
                'Live SSE stream of agent thoughts for transparency.',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-surface p-5 rounded border border-border text-center"
            >
              <h3 className="text-lg font-medium text-accent-green mb-2">
                {f.title}
              </h3>

              <p className="text-text text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}