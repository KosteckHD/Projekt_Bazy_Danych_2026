import { query, queryOne } from '../config/db.js';
import { buildUpdateSet } from '../config/sql.js';
import { conflict, notFound } from '../handlers/httpError.js';

export type ModelInput = {
  modelName: string;
  brandId: number;
  hourlyCost: number;
  modelDescription?: string | null;
};

const modelSelect = `
  SELECT
    m.modelId AS "modelId",
    m.modelName AS "modelName",
    m.brandId AS "brandId",
    b.brandName AS "brandName",
    b.country,
    m.hourlyCost::float AS "hourlyCost",
    m.modelDescription AS "modelDescription",
    m.createdAt AS "createdAt",
    m.updatedAt AS "updatedAt"
  FROM Models m
  JOIN Brands b ON b.brandId = m.brandId
`;

export async function listModels() {
  return query(`
    SELECT
      m.modelId AS "modelId",
      m.modelName AS "modelName",
      m.brandId AS "brandId",
      b.brandName AS "brandName",
      m.hourlyCost::float AS "hourlyCost",
      m.modelDescription AS "modelDescription",
      COUNT(c.carId)::int AS "carCount",
      COUNT(c.carId) FILTER (WHERE c.status = 'Available' AND c.isActive = TRUE)::int AS "availableCarCount"
    FROM Models m
    JOIN Brands b ON b.brandId = m.brandId
    LEFT JOIN Cars c ON c.modelId = m.modelId
    GROUP BY m.modelId, b.brandId
    ORDER BY b.brandName ASC, m.modelName ASC
  `);
}

export async function getModel(id: number) {
  const model = await queryOne(`${modelSelect} WHERE m.modelId = $1`, [id]);
  if (!model) {
    notFound('Model not found');
  }

  return model;
}

export async function listModelsByBrand(brandId: number) {
  return query(`${modelSelect} WHERE m.brandId = $1 ORDER BY m.modelName ASC`, [brandId]);
}

export async function createModel(input: ModelInput) {
  return queryOne(
    `
      INSERT INTO Models (modelName, brandId, hourlyCost, modelDescription)
      VALUES ($1, $2, $3, $4)
      RETURNING
        modelId AS "modelId",
        modelName AS "modelName",
        brandId AS "brandId",
        hourlyCost::float AS "hourlyCost",
        modelDescription AS "modelDescription",
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
    `,
    [input.modelName, input.brandId, input.hourlyCost, input.modelDescription ?? null],
  );
}

export async function updateModel(id: number, input: Partial<ModelInput>) {
  const values: unknown[] = [];
  const setClause = buildUpdateSet(
    input,
    {
      modelName: 'modelName',
      brandId: 'brandId',
      hourlyCost: 'hourlyCost',
      modelDescription: 'modelDescription',
    },
    values,
  );

  values.push(id);
  const model = await queryOne(
    `
      UPDATE Models
      SET ${setClause}
      WHERE modelId = $${values.length}
      RETURNING
        modelId AS "modelId",
        modelName AS "modelName",
        brandId AS "brandId",
        hourlyCost::float AS "hourlyCost",
        modelDescription AS "modelDescription",
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
    `,
    values,
  );

  if (!model) {
    notFound('Model not found');
  }

  return model;
}

export async function deleteModel(id: number) {
  const usage = await queryOne<{ count: string }>(
    'SELECT COUNT(*) AS count FROM Cars WHERE modelId = $1',
    [id],
  );

  if (Number(usage?.count ?? 0) > 0) {
    conflict('Model has assigned cars and cannot be deleted');
  }

  const model = await queryOne('DELETE FROM Models WHERE modelId = $1 RETURNING modelId', [id]);
  if (!model) {
    notFound('Model not found');
  }
}
