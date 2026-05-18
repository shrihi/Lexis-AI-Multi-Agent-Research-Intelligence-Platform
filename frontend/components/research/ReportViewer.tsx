'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import SourceCard from '@/components/research/SourceCard';
import ContradictionAlert from '@/components/research/ContradictionAlert';
import ConfidenceChart from '@/components/research/ConfidenceChart';
import ModelUsagePanel from '@/components/research/ModelUsagePanel';

interface ReportViewerProps {
  sessionId: string;
}

export default function ReportViewer({
  sessionId,
}: ReportViewerProps) {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const resp = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/research/report/${sessionId}`
        );

        if (resp.ok) {
          const data = await resp.json();
          setReport(data);
        }
      } catch {
        // Silently fail — report stays null
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [sessionId]);

  return (
    <div className="grid md:grid-cols-[70%_30%] gap-6">
      {/* LEFT PANEL */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-accent-green">
          Research Report
        </h2>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-pulse bg-surface rounded px-4 py-2">
              Loading report...
            </div>
          </div>
        ) : report ? (
          <>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report.report_markdown ||
                  '# Report content not available'}
              </ReactMarkdown>
            </div>

            <Link
              href="/memory"
              className="text-accent-blue hover:underline"
            >
              ← Back to Memory
            </Link>
          </>
        ) : (
          <div className="text-center py-8 text-secondary">
            No report found
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="space-y-4 bg-surface rounded-lg border border-border p-4">
        {/* SOURCES */}
        <h3 className="text-xl font-bold text-accent-green mb-4">
          Sources ({report?.sources?.length || 0})
        </h3>

        {isLoading ? (
          <div className="h-32 flex items-center justify-center text-secondary">
            Loading sources...
          </div>
        ) : report?.sources &&
          report.sources.length > 0 ? (
          <div className="space-y-2">
            {report.sources.map(
              (source: any, index: number) => (
                <SourceCard
                  key={source.id || index}
                  source={source}
                  index={index + 1}
                />
              )
            )}
          </div>
        ) : (
          <p className="text-secondary">
            No sources found
          </p>
        )}

        {/* MODEL USAGE */}
        <h3 className="text-xl font-bold text-accent-green mb-4">
          Model Usage
        </h3>

        {isLoading ? (
          <div className="h-20 flex items-center justify-center text-secondary">
            Loading model usage...
          </div>
        ) : report?.model_usage &&
          report.model_usage.length > 0 ? (
          <ModelUsagePanel
            modelUsage={report.model_usage}
          />
        ) : (
          <p className="text-secondary">
            No model usage data
          </p>
        )}

        {/* CONFIDENCE SCORES */}
        <h3 className="text-xl font-bold text-accent-green mb-4">
          Confidence Scores
        </h3>

        {isLoading ? (
          <div className="h-32 flex items-center justify-center text-secondary">
            Loading confidence data...
          </div>
        ) : report?.claims &&
          report.claims.length > 0 ? (
          <ConfidenceChart claims={report.claims} />
        ) : (
          <p className="text-secondary">
            No confidence data
          </p>
        )}

        {/* CONTRADICTIONS */}
        {report?.contradictions &&
        report.contradictions.length > 0 ? (
          <>
            <h3 className="text-xl font-bold text-accent-green mb-4">
              Contradictions Detected
            </h3>

            <div className="space-y-3">
              {report.contradictions.map(
                (
                  contradiction: any,
                  index: number
                ) => (
                  <ContradictionAlert
                    key={index}
                    contradiction={contradiction}
                  />
                )
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}