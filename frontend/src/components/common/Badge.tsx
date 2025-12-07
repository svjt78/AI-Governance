import React from 'react';
import type { RiskLevel, GovernanceStatus, BiasTestStatus, DriftStatus } from '@/lib/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'risk' | 'status' | 'bias' | 'drift';
  value?: RiskLevel | GovernanceStatus | BiasTestStatus | DriftStatus | string;
  className?: string;
}

export default function Badge({ children, variant = 'default', value, className = '' }: BadgeProps) {
  const getColorClasses = () => {
    if (variant === 'risk') {
      switch (value) {
        case 'critical': return 'bg-red-200 text-red-900';
        case 'high': return 'bg-red-100 text-red-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'low': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }

    if (variant === 'status') {
      switch (value) {
        case 'approved_for_prod': return 'bg-green-100 text-green-800';
        case 'in_review': return 'bg-blue-100 text-blue-800';
        case 'temporarily_suspended': return 'bg-yellow-100 text-yellow-800';
        case 'retired': return 'bg-gray-100 text-gray-800';
        case 'draft': return 'bg-gray-100 text-gray-600';
        default: return 'bg-gray-100 text-gray-800';
      }
    }

    if (variant === 'bias') {
      switch (value) {
        case 'unacceptable': return 'bg-red-100 text-red-800';
        case 'needs_review': return 'bg-yellow-100 text-yellow-800';
        case 'acceptable': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }

    if (variant === 'drift') {
      switch (value) {
        case 'breached': return 'bg-red-100 text-red-800';
        case 'within_tolerance': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }

    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClasses()} ${className}`}>
      {children}
    </span>
  );
}
