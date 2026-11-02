import React from 'react';
import { Code, BookOpen, Briefcase, Award } from 'lucide-react';

const badgeConfig = {
  tech: {
    label: 'Inovação & Tech',
    bg: 'bg-navy/10',
    text: 'text-navy',
    border: 'border-navy/20',
    icon: Code,
  },
  academic: {
    label: 'Vida Acadêmica',
    bg: 'bg-brand-green/10',
    text: 'text-brand-green',
    border: 'border-brand-green/20',
    icon: BookOpen,
  },
  career: {
    label: 'Pronto p/ Mercado',
    bg: 'bg-gold/15',
    text: 'text-amber-800',
    border: 'border-gold/30',
    icon: Briefcase,
  },
  verified: {
    label: 'Perfil Verificado',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: Award,
  },
};

export default function Badge({ type }) {
  const config = badgeConfig[type] || badgeConfig.verified;
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
