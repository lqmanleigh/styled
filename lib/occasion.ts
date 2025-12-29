export function classifyOccasion(title: string, description: string): string {
  const text = `${title ?? ""} ${description ?? ""}`.toLowerCase();

  if (/(wedding|reception|nikah|dinner|gala)/.test(text)) return "formal";
  if (/(presentation|meeting|pitch|interview)/.test(text)) return "business";
  if (/(sports? day|jogging|marathon|training)/.test(text)) return "sport";
  if (/(outing|hangout|cafe|lepak)/.test(text)) return "casual";

  return "general";
}
