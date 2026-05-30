export type FieldMap = Record<string, string>;

export function addFilter(
  clauses: string[],
  values: unknown[],
  sql: string,
  value: unknown,
): void {
  if (value === undefined || value === null || value === '') {
    return;
  }

  values.push(value);
  clauses.push(sql.replace('?', `$${values.length}`));
}

export function buildUpdateSet(
  input: Record<string, unknown>,
  fieldMap: FieldMap,
  values: unknown[],
): string {
  const assignments: string[] = [];

  for (const [key, column] of Object.entries(fieldMap)) {
    if (Object.prototype.hasOwnProperty.call(input, key) && input[key] !== undefined) {
      values.push(input[key]);
      assignments.push(`${column} = $${values.length}`);
    }
  }

  values.push(new Date());
  assignments.push(`updatedAt = $${values.length}`);

  return assignments.join(', ');
}
