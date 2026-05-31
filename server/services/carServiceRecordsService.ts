import { query, queryOne } from '../config/db.js';
import { buildUpdateSet } from '../config/sql.js';
import { notFound } from '../handlers/httpError.js';

export async function listServices() {
  return query(`
    SELECT
      serviceRecordId AS "serviceRecordId",
      carId AS "carId",
      description,
      serviceDate AS "serviceDate",
      cost::float AS "cost",
      isCompleted AS "isCompleted",
      createdAt AS "createdAt",
      updatedAt AS "updatedAt"
    FROM CarServiceRecords
    ORDER BY serviceDate DESC, createdAt DESC
  `);
}

export async function listServicesByCar(carId: number) {
  return query(
    `
      SELECT
        serviceRecordId AS "serviceRecordId",
        carId AS "carId",
        description,
        serviceDate AS "serviceDate",
        cost::float AS "cost",
        isCompleted AS "isCompleted",
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
      FROM CarServiceRecords
      WHERE carId = $1
      ORDER BY serviceDate DESC
    `,
    [carId],
  );
}

export async function createService(input: Record<string, unknown>) {
  return queryOne(
    `
      INSERT INTO CarServiceRecords (carId, description, serviceDate, cost, isCompleted)
      VALUES ($1, $2, COALESCE($3, CURRENT_DATE), $4, $5)
      RETURNING
        serviceRecordId AS "serviceRecordId",
        carId AS "carId",
        description,
        serviceDate AS "serviceDate",
        cost::float AS "cost",
        isCompleted AS "isCompleted",
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
    `,
    [
      input.carId,
      input.description,
      input.serviceDate ?? null,
      input.cost ?? 0,
      input.isCompleted ?? false,
    ],
  );
}

export async function updateService(id: number, input: Record<string, unknown>) {
  const values: unknown[] = [];
  const setClause = buildUpdateSet(
    input,
    {
      description: 'description',
      serviceDate: 'serviceDate',
      cost: 'cost',
      isCompleted: 'isCompleted',
    },
    values,
  );

  values.push(id);
  const service = await queryOne(
    `
      UPDATE CarServiceRecords
      SET ${setClause}
      WHERE serviceRecordId = $${values.length}
      RETURNING
        serviceRecordId AS "serviceRecordId",
        carId AS "carId",
        description,
        serviceDate AS "serviceDate",
        cost::float AS "cost",
        isCompleted AS "isCompleted",
        updatedAt AS "updatedAt"
    `,
    values,
  );

  if (!service) {
    notFound('Service record not found');
  }

  return service;
}

export async function deleteService(id: number) {
  const service = await queryOne(
    'DELETE FROM CarServiceRecords WHERE serviceRecordId = $1 RETURNING serviceRecordId',
    [id],
  );

  if (!service) {
    notFound('Service record not found');
  }
}
