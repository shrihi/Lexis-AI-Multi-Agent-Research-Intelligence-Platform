'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSessionStore } from '@/lib/store';

type MemoryCardProps = {
  session: any;
};

function getStatusClass(status: string) {
  return status === 'complete'
    ? 'text-accent-green'
    : status === 'error'
    ? 'text-accent-red'
    : 'text-secondary';
}

function getStatusLabel(status: string) {
  return status === 'complete'
    ? 'Completed'
    : status === 'error'
    ? 'Error'
    : 'Running';
}

export default function MemoryCard({
  session,
}: MemoryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteSession = useSessionStore(
    (state) => state.deleteSession
  );

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteSession(session.id);
    } catch (error) {
      setIsDeleting(false);
      console.error('Failed to delete session:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {!isDeleting && (
        <div className="rounded border border-border bg-surface p-4 hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 rounded bg-elevated p-2">
              <div className="text-xs text-secondary truncate">
                🔍 {session.query?.slice(0, 30)}...
              </div>
            </div>

            <div className="mb-2 mt-3 flex justify-between">
              <span className="text-sm text-accent-green font-medium">
                {session.id?.slice(0, 8)}
              </span>

              <span
                className={`${getStatusClass(
                  session.status
                )} text-xs font-medium`}
              >
                {getStatusLabel(session.status)}
              </span>
            </div>

            <div className="mb-3 flex items-center gap-2 text-sm text-muted">
              <span>
                {session.sources?.length || 0} sources
              </span>

              <span>
                {session.contradictions?.length || 0}{' '}
                contradictions
              </span>
            </div>

            {session.created_at && (
              <div className="mb-2 text-xs text-secondary">
                {formatDate(session.created_at)}
              </div>
            )}
          </div>

          <div className="flex mt-2 justify-end gap-2">
            <Link
              href={`/research/${session.id}`}
              className="rounded bg-accent-blue text-primary px-2 py-1 hover:bg-accent-green transition-colors"
            >
              View Report
            </Link>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`rounded bg-primary text-secondary px-2 py-1 hover:bg-accent-red transition-colors ${
                isDeleting ? 'opacity-50' : ''
              }`}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}