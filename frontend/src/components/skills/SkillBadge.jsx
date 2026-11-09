import { X } from 'lucide-react';
import { levelLabel } from '../../utils/constants';

const VARIANTS = {
  offered: 'bg-brand-50 text-brand-800 ring-1 ring-brand-200',
  wanted: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  match: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300',
  neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

export default function SkillBadge({ skill, variant = 'neutral', showLevel = false, onRemove }) {
  return (
    <span className={`badge ${VARIANTS[variant] || VARIANTS.neutral}`}>
      {skill.name}
      {showLevel && skill.level && <span className="font-normal opacity-70">· {levelLabel(skill.level)}</span>}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(skill)}
          className="-mr-1 rounded-full p-0.5 hover:bg-black/10"
          aria-label={`Remove ${skill.name}`}
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
