import { query, queryOne } from '../config/db.js';
import { buildUpdateSet } from '../config/sql.js';
import { conflict, notFound } from '../handlers/httpError.js';

export type BrandInput = {
  brandName: string;
  country: string;
};

export async function listBrands() {
  return query(`
    SELECT
      b.brandId AS "brandId",
      b.brandId AS "brandid",
      b.brandName AS "brandName",
      b.brandName AS "brandname",
      b.country,
      COUNT(DISTINCT m.modelId)::int AS "modelCount",
      COUNT(DISTINCT c.carId)::int AS "carCount",
      b.createdAt AS "createdAt",
      b.updatedAt AS "updatedAt"
    FROM Brands b
    LEFT JOIN Models m ON m.brandId = b.brandId
    LEFT JOIN Cars c ON c.modelId = m.modelId
    GROUP BY b.brandId
    ORDER BY b.brandName ASC
  `);
}

export async function getBrand(id: number) {
  const brand = await queryOne(
    `
      SELECT
        brandId AS "brandId",
        brandName AS "brandName",
        country,
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
      FROM Brands
      WHERE brandId = $1
    `,
    [id],
  );

  if (!brand) {
    notFound('Brand not found');
  }

  return brand;
}

export async function listBrandModels(brandId: number) {
  return query(
    `
      SELECT
        m.modelId AS "modelId",
        m.modelName AS "modelName",
        m.brandId AS "brandId",
        m.hourlyCost::float AS "hourlyCost",
        m.modelDescription AS "modelDescription",
        COUNT(c.carId)::int AS "carCount",
        COUNT(c.carId) FILTER (WHERE c.status = 'Available' AND c.isActive = TRUE)::int AS "availableCarCount"
      FROM Models m
      LEFT JOIN Cars c ON c.modelId = m.modelId
      WHERE m.brandId = $1
      GROUP BY m.modelId
      ORDER BY m.modelName ASC
    `,
    [brandId],
  );
}

export async function createBrand(input: BrandInput) {
  return queryOne(
    `
      INSERT INTO Brands (brandName, country)
      VALUES ($1, $2)
      RETURNING
        brandId AS "brandId",
        brandName AS "brandName",
        country,
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
    `,
    [input.brandName, input.country],
  );
}

export async function updateBrand(id: number, input: Partial<BrandInput>) {
  const values: unknown[] = [];
  const setClause = buildUpdateSet(
    input,
    {
      brandName: 'brandName',
      country: 'country',
    },
    values,
  );

  values.push(id);
  const brand = await queryOne(
    `
      UPDATE Brands
      SET ${setClause}
      WHERE brandId = $${values.length}
      RETURNING
        brandId AS "brandId",
        brandName AS "brandName",
        country,
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
    `,
    values,
  );

  if (!brand) {
    notFound('Brand not found');
  }

  return brand;
}

export async function deleteBrand(id: number) {
  const usage = await queryOne<{ count: string }>(
    'SELECT COUNT(*) AS count FROM Models WHERE brandId = $1',
    [id],
  );

  if (Number(usage?.count ?? 0) > 0) {
    conflict('Brand has assigned models and cannot be deleted');
  }

  const brand = await queryOne('DELETE FROM Brands WHERE brandId = $1 RETURNING brandId', [id]);
  if (!brand) {
    notFound('Brand not found');
  }
}
