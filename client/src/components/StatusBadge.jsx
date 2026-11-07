import React from 'react';
import { 
  CheckCircle2, Clock, AlertCircle, XCircle, Award, 
  HelpCircle, FileText, Sparkles 
} from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const styles = {
    APPLIED: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
      label: 'Application Received'
    },
    SHORTLISTED: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Sparkles,
      label: 'Shortlisted'
    },
    TEST_INVITED: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertCircle,
      label: 'Online Test Pending'
    },
    TEST_IN_PROGRESS: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: FileText,
      label: 'Test In Progress'
    },
    TEST_COMPLETED: {
      bg: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: CheckCircle2,
      label: 'Test Evaluated'
    },
    UNDER_REVIEW: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: HelpCircle,
      label: 'Under Review'
    },
    SELECTED: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
      icon: Award,
      label: '🎉 Selected / Offer Rolled Out'
    },
    REJECTED: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      label: 'Not Selected'
    }
  };

  const current = styles[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
    label: status || 'Unknown'
  };

  const Icon = current.icon;
  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm gap-2' : 'px-2.5 py-0.5 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${current.bg} ${sizeClasses}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{current.label}</span>
    </span>
  );
}
