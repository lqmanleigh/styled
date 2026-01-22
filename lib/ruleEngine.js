export function classifyEvent(summary, rules) {
  if (!summary) return null;

  const text = summary.toLowerCase();

  // Sort by priority (high → low)
  const sortedRules = [...rules]
    .filter((r) => r.enabled)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    for (const k of rule.keywords) {
      if (k.enabled && text.includes(k.keyword.toLowerCase())) {
        return rule.targetCategory;
      }
    }
  }

  return null;
}
