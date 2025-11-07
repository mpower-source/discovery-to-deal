import { LeadStatus } from '../lib/supabase';

interface StatusBadgeProps {
  status: LeadStatus;
  errorMessage?: string | null;
}

export function StatusBadge({ status, errorMessage }: StatusBadgeProps) {
  const styles = {
    'Not Started': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    'In Progress': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    Completed: 'bg-green-500/20 text-green-300 border-green-500/30',
    Error: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
      title={errorMessage || undefined}
    >
      {status}
    </span>
  );
}
