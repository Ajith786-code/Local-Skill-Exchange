function getProfileCompletion(user) {
  const checks = [
    { key: 'bio', label: 'Add a short bio', done: Boolean(user.bio && user.bio.trim()) },
    { key: 'avatar', label: 'Add a profile picture URL', done: Boolean(user.avatar) },
    { key: 'availability', label: 'Set your availability', done: Boolean(user.availability && user.availability.trim()) },
    { key: 'offeredSkills', label: 'Add a skill you can teach', done: user.offeredSkills.length > 0 },
    { key: 'wantedSkills', label: 'Add a skill you want to learn', done: user.wantedSkills.length > 0 },
    { key: 'city', label: 'Set your city', done: Boolean(user.city) },
  ];
  const done = checks.filter((c) => c.done).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter((c) => !c.done).map((c) => ({ key: c.key, label: c.label })),
  };
}

module.exports = { getProfileCompletion };
