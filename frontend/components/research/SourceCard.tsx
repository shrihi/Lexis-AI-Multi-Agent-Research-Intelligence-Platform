interface SourceCardProps {
  source: any;
  index: number;
}

export default function SourceCard({ source, index }: SourceCardProps) {
  return (
    <div className="border border-border rounded-lg p-3 hover:bg-elevated transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-accent-blue text-sm">
          <span className="text-muted mr-2">[{index}]</span>
          {source.title || 'Source'}
        </h4>
        <div className="text-xs text-accent-green">
          {Math.round((source.relevance_score || 0) * 100)}%
        </div>
      </div>
      <div className="text-xs text-muted mb-2">
        {source.url}
      </div>
      <p className="text-sm text-text line-clamp-2">
        {source.summary || 'No summary available'}
      </p>
    </div>
  );
}