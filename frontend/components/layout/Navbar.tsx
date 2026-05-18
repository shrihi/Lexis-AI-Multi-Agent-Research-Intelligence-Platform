import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-surface border-b border-border px-4 py-2 flex justify-between items-center">
      <div className="text-xl font-bold text-accent-green">
        Lexis AI
      </div>

      <div className="flex space-x-4">
        <Link
          href="/"
          className="text-text hover:text-accent-blue"
        >
          Home
        </Link>

        <Link
          href="/research"
          className="text-text hover:text-accent-blue"
        >
          Research
        </Link>

        <Link
          href="/memory"
          className="text-text hover:text-accent-blue"
        >
          Memory
        </Link>
      </div>
    </nav>
  );
}