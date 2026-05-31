import { query, queryOne } from '../config/db.js';
import { buildUpdateSet } from '../config/sql.js';
import { notFound } from '../handlers/httpError.js';

export async function listDamages() {
  return query(`
    SELECT
      damageReportId AS "damageReportId",
      carId AS "carId",
      rentId AS "rentId",
      description,
      repairCost::float AS "repairCost",
      isResolved AS "isResolved",
      reportedAt AS "reportedAt",
      resolvedAt AS "resolvedAt"
    FROM CarDamageReports
    ORDER BY reportedAt DESC
  `);
}

export async function createDamage(input: Record<string, unknown>) {
  return queryOne(
    `
      INSERT INTO CarDamageReports (carId, rentId, description, repairCost)
      VALUES ($1, $2, $3, $4)
      RETURNING
        damageReportId AS "damageReportId",
        carId AS "carId",
        rentId AS "rentId",
        description,
        repairCost::float AS "repairCost",
        isResolved AS "isResolved",
        reportedAt AS "reportedAt"
    `,
    [input.carId, input.rentId ?? null, input.description, input.repairCost ?? 0],
  );
}

export async function updateDamage(id: number, input: Record<string, unknown>) {
  const body = {
    ...input,
    resolvedAt: input.isResolved === true ? new Date() : input.isResolved === false ? null : undefined,
  };
  const values: unknown[] = [];
  const setClause = buildUpdateSet(
    body,
    {
      description: 'description',
      repairCost: 'repairCost',
      isResolved: 'isResolved',
      resolvedAt: 'resolvedAt',
    },
    values,
  );

  values.push(id);
  const damage = await queryOne(
    `
      UPDATE CarDamageReports
      SET ${setClause}
      WHERE damageReportId = $${values.length}
      RETURNING
        damageReportId AS "damageReportId",
        carId AS "carId",
        rentId AS "rentId",
        description,
        repairCost::float AS "repairCost",
        isResolved AS "isResolved",
        reportedAt AS "reportedAt",
        resolvedAt AS "resolvedAt"
    `,
    values,
  );

  if (!damage) {
    notFound('Damage report not found');
  }

  return damage;
}

export async function deleteDamage(id: number) {
  const damage = await queryOne(
    'DELETE FROM CarDamageReports WHERE damageReportId = $1 AND isResolved = FALSE RETURNING damageReportId',
    [id],
  );

  if (!damage) {
    notFound('Open damage report not found');
  }
}
