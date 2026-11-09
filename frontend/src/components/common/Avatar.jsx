import { useState } from 'react';
import { getInitials } from '../../utils/formatters';

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-24 w-24 text-3xl' };

export default function Avatar({ name, src, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const cls = SIZES[size] || SIZES.md;
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`${name || 'User'} profile`}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
        className={`${cls} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${cls} inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700`}
    >
      {getInitials(name)}
    </span>
  );
}
