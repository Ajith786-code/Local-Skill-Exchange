import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import SkillBadge from './SkillBadge';
import { CATEGORIES, LEVELS } from '../../utils/constants';
import { SKILL_NAME_PATTERN, normalizeSkill } from '../../utils/validators';

// Add / remove skills in a list. Suggestions come from the shared skill catalog (datalist).
export default function SkillEditor({ title, description, kind, skills, onChange, suggestions = [] }) {
  const listId = useId();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Other');
  const [level, setLevel] = useState('beginner');
  const [error, setError] = useState('');

  const add = () => {
    const clean = name.trim().replace(/\s+/g, ' ');
    if (!clean) return setError('Enter a skill name');
    if (clean.length > 50) return setError('Skill name must be 50 characters or fewer');
    if (!SKILL_NAME_PATTERN.test(clean)) return setError('Skill name contains unsupported characters');
    if (skills.some((s) => s.normalized === normalizeSkill(clean))) return setError('You already added this skill');
    if (skills.length >= 20) return setError('You can add at most 20 skills');

    const catalog = suggestions.find((s) => s.normalized === normalizeSkill(clean));
    onChange([...skills, { name: catalog ? catalog.name : clean, normalized: normalizeSkill(clean), category: catalog && category === 'Other' ? catalog.category : category, level }]);
    setName('');
    setError('');
  };

  const remove = (skill) => onChange(skills.filter((s) => s.normalized !== skill.normalized));

  return (
    <section className="card p-5" aria-labelledby={`${listId}-title`}>
      <h3 id={`${listId}-title`} className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-0.5 text-sm text-slate-500">{description}</p>

      <div className="mt-4 flex min-h-[2rem] flex-wrap gap-2" aria-live="polite">
        {skills.length === 0 && <p className="text-sm text-slate-400">No skills added yet.</p>}
        {skills.map((s) => (
          <SkillBadge key={s.normalized} skill={s} variant={kind} showLevel onRemove={remove} />
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <div>
          <label htmlFor={`${listId}-name`} className="sr-only">Skill name</label>
          <input
            id={`${listId}-name`}
            list={`${listId}-options`}
            className={`input ${error ? 'input-error' : ''}`}
            placeholder="e.g. Guitar, Excel, Spanish"
            value={name}
            maxLength={50}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${listId}-error` : undefined}
          />
          <datalist id={`${listId}-options`}>
            {suggestions.map((s) => <option key={s.id} value={s.name} />)}
          </datalist>
        </div>
        <div>
          <label htmlFor={`${listId}-cat`} className="sr-only">Category</label>
          <select id={`${listId}-cat`} className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${listId}-level`} className="sr-only">{kind === 'offered' ? 'Your experience level' : 'Your current level'}</label>
          <select id={`${listId}-level`} className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
            {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <button type="button" className="btn-secondary" onClick={add}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add
        </button>
      </div>
      {error && <p id={`${listId}-error`} role="alert" className="field-error">{error}</p>}
    </section>
  );
}
