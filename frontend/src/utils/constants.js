export const CATEGORIES = [
  'Programming and Technology', 'Music', 'Languages', 'Cooking', 'Design',
  'Business', 'Academics', 'Fitness and Sports', 'Photography', 'Other',
];

export const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export const MODES = [
  { value: 'either', label: 'Online or in person' },
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In person' },
];

export const REQUEST_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

export const levelLabel = (v) => LEVELS.find((l) => l.value === v)?.label || v;
export const modeLabel = (v) => MODES.find((m) => m.value === v)?.label || v;
