import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ConfidenceChartProps {
  claims: Array<{ text: string; confidence: number; category: string }>;
}

export default function ConfidenceChart({ claims }: ConfidenceChartProps) {
  const chartData = claims.map((claim) => ({
    name: claim.category || 'Other',
    confidence: claim.confidence,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 1]} />
        <YAxis dataKey="name" type="category" width={80} />
        <Tooltip />
        <Bar dataKey="confidence" fill="#00ff88" />
      </BarChart>
    </ResponsiveContainer>
  );
}