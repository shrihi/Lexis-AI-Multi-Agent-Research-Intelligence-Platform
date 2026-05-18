import { useState } from 'react';
// Using basic HTML elements for form controls


export default function ResearchForm() {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const url = new URL('/api/research/start', window.location.origin);
    url.searchParams.append('query', query);
    url.searchParams.append('depth', depth.toString());
    window.location.href = url.toString();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="query" className="block text-sm font-medium text-text mb-1">Research Question</label>
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
        <label htmlFor="depth" className="block text-sm font-medium text-text mb-1">Depth (1-5)</label>
        <input
          id="depth"
          type="number"
          min="1"
          max="5"
          value={depth}
          onChange={(e) => setDepth(parseInt(e.target.value) || 3)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:border-accent-blue"
        />
      </div>
      <button type="submit" className="w-full bg-accent-green text-primary hover:bg-accent-green/80 px-4 py-2 rounded-md mt-4">
        Start Research
      </button>
    </form>
  );
}