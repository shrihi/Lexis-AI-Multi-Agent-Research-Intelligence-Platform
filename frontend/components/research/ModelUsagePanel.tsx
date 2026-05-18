interface ModelUsage {
  agent: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
}

interface ModelUsagePanelProps {
  modelUsage: ModelUsage[];
}

export default function ModelUsagePanel({ modelUsage }: ModelUsagePanelProps) {
  if (!modelUsage?.length) return <p className="text-secondary">No model usage data</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-border text-sm">
        <thead>
          <tr className="bg-elevated">
            <th className="border border-border p-2 text-left">Agent</th>
            <th className="border border-border p-2 text-left">Model</th>
            <th className="border border-border p-2 text-left">In Tokens</th>
            <th className="border border-border p-2 text-left">Out Tokens</th>
            <th className="border border-border p-2 text-left">Cost (USD)</th>
          </tr>
        </thead>
        <tbody>
          {modelUsage.map((u, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-surface' : 'bg-elevated'}>
              <td className="border border-border p-2">{u.agent}</td>
              <td className="border border-border p-2">{u.model}</td>
              <td className="border border-border p-2">{u.tokens_in}</td>
              <td className="border border-border p-2">{u.tokens_out}</td>
              <td className="border border-border p-2">{u.cost_usd.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}