import type { LucideIcon } from 'lucide-react';

export function FinancialStat({
  label,
  value,
  note,
  icon: Icon,
  tone = 'green',
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone?: 'green' | 'blue' | 'orange' | 'purple';
}) {
  return (
    <article className="finance-stat" data-tone={tone}>
      <div className="finance-stat-heading">
        <span>{label}</span>
        <span className="finance-stat-icon" aria-hidden="true">
          <Icon size={19} strokeWidth={1.75} />
        </span>
      </div>
      <strong className={'finance-stat-value' + (value.length > 12 ? ' is-long' : '')}>
        {value}
      </strong>
      <small>{note}</small>
    </article>
  );
}
