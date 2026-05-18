'use client';
import { notFound } from 'next/navigation';
import ReportViewer from '@/components/research/ReportViewer';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="container-main py-8">
      <ReportViewer sessionId={id} />
    </div>
  );
}