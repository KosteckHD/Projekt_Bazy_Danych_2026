import { query, queryOne } from '../config/db.js';
import { addFilter, buildUpdateSet } from '../config/sql.js';
import { conflict, notFound } from '../handlers/httpError.js';

export type CarInput = {
  modelId: number;
  branchId?: number | null;
  status?: string;
  color: string;
  doorAmount: number;
  productionDate: string;
  VIN: string;
  registrationNumber?: string | null;
  mileage?: number;
  carEngine: number;
  horsePower: number;
  bodyType: string;
  isActive?: boolean;
};

export type CarFilters = {
  brandId?: number;
  modelId?: number;
  branchId?: number;
  status?: string;
  color?: string;
  bodyType?: string;
  minHourlyCost?: number;
  maxHourlyCost?: number;
  availableOnly?: boolean;
};

const carSelect = `
  SELECT
    c.carId AS "carId",
    c.modelId AS "modelId",
    m.modelName AS "modelName",
    m.hourlyCost::float AS "hourlyCost",
    b.brandId AS "brandId",
    b.brandName AS "brandName",
    c.branchId AS "branchId",
    br.branchName AS "branchName",
    c.status,
    c.color,
    c.doorAmount AS "doorAmount",
    c.productionDate AS "productionDate",
    c.VIN AS "VIN",
    c.registrationNumber AS "registrationNumber",
    c.mileage,
    c.carEngine::float AS "carEngine",
    c.horsePower AS "horsePower",
    c.bodyType AS "bodyType",
    c.isActive AS "isActive",
    c.createdAt AS "createdAt",
    c.updatedAt AS "updatedAt"
  FROM Cars c
  JOIN Models m ON m.modelId = c.modelId
  JOIN Brands b ON b.brandId = m.brandId
  LEFT JOIN Branches br ON br.branchId = c.branchId
`;

export async function listCars(filters: CarFilters) {
  const clauses: string[] = ['c.isActive = TRUE'];
  const values: unknown[] = [];

  addFilter(clauses, values, 'b.brandId = ?', filters.brandId);
  addFilter(clauses, values, 'c.modelId = ?', filters.modelId);
  addFilter(clauses, values, 'c.branchId = ?', filters.branchId);
  addFilter(clauses, values, 'c.status = ?', filters.status);
  addFilter(clauses, values, 'c.color = ?', filters.color);
  addFilter(clauses, values, 'c.bodyType = ?', filters.bodyType);
  addFilter(clauses, values, 'm.hourlyCost >= ?', filters.minHourlyCost);
  addFilter(clauses, values, 'm.hourlyCost <= ?', filters.maxHourlyCost);

  if (filters.availableOnly === true) {
    clauses.push("c.status = 'Available'");
  }

  return query(
    `${carSelect} WHERE ${clauses.join(' AND ')} ORDER BY b.brandName ASC, m.modelName ASC`,
    values,
  );
}

export async function listAvailableCars() {
  return query('SELECT * FROM vw_available_cars ORDER BY brandName ASC, modelName ASC');
}

export async function getCar(id: number) {
  const car = await queryOne(`${carSelect} WHERE c.carId = $1`, [id]);
  if (!car) {
    notFound('Car not found');
  }

  return car;
}

export async function listCarRents(id: number) {
  return query(
    `
      SELECT
        r.rentId AS "rentId",
        r.userId AS "userId",
        u.firstName AS "firstName",
        u.lastName AS "lastName",
        r.startDate AS "startDate",
        r.expectedEndDate AS "expectedEndDate",
        r.endDate AS "endDate",
        r.additionalCost::float AS "additionalCost",
        r.totalCost::float AS "totalCost",
        r.status
      FROM Rents r
      JOIN Users u ON u.userId = r.userId
      WHERE r.carId = $1
      ORDER BY r.startDate DESC
    `,
    [id],
  );
}

export async function createCar(input: CarInput) {
  return queryOne(
    `
      INSERT INTO Cars (
        modelId, branchId, status, color, doorAmount, productionDate, VIN,
        registrationNumber, mileage, carEngine, horsePower, bodyType
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING
        carId AS "carId",
        modelId AS "modelId",
        branchId AS "branchId",
        status,
        color,
        doorAmount AS "doorAmount",
        productionDate AS "productionDate",
        VIN AS "VIN",
        registrationNumber AS "registrationNumber",
        mileage,
        carEngine::float AS "carEngine",
        horsePower AS "horsePower",
        bodyType AS "bodyType",
        isActive AS "isActive",
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
    `,
    [
      input.modelId,
      input.branchId ?? null,
      input.status ?? 'Available',
      input.color,
      input.doorAmount,
      input.productionDate,
      input.VIN,
      input.registrationNumber ?? null,
      input.mileage ?? 0,
      input.carEngine,
      input.horsePower,
      input.bodyType,
    ],
  );
}

export async function updateCar(id: number, input: Partial<CarInput>) {
  const values: unknown[] = [];
  const setClause = buildUpdateSet(
    input,
    {
      modelId: 'modelId',
      branchId: 'branchId',
      status: 'status',
      color: 'color',
      doorAmount: 'doorAmount',
      productionDate: 'productionDate',
      VIN: 'VIN',
      registrationNumber: 'registrationNumber',
      mileage: 'mileage',
      carEngine: 'carEngine',
      horsePower: 'horsePower',
      bodyType: 'bodyType',
      isActive: 'isActive',
    },
    values,
  );

  values.push(id);
  const car = await queryOne(
    `
      UPDATE Cars
      SET ${setClause}
      WHERE carId = $${values.length}
      RETURNING
        carId AS "carId",
        modelId AS "modelId",
        branchId AS "branchId",
        status,
        color,
        doorAmount AS "doorAmount",
        productionDate AS "productionDate",
        VIN AS "VIN",
        registrationNumber AS "registrationNumber",
        mileage,
        carEngine::float AS "carEngine",
        horsePower AS "horsePower",
        bodyType AS "bodyType",
        isActive AS "isActive",
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
    `,
    values,
  );

  if (!car) {
    notFound('Car not found');
  }

  return car;
}

export async function updateCarStatus(id: number, status: string) {
  const car = await queryOne(
    `
      UPDATE Cars
      SET status = $1, updatedAt = NOW()
      WHERE carId = $2
      RETURNING carId AS "carId", status, updatedAt AS "updatedAt"
    `,
    [status, id],
  );

  if (!car) {
    notFound('Car not found');
  }

  return car;
}

export async function deleteCar(id: number) {
  const usage = await queryOne<{ count: string }>(
    'SELECT COUNT(*) AS count FROM Rents WHERE carId = $1',
    [id],
  );

  if (Number(usage?.count ?? 0) > 0) {
    const archived = await queryOne(
      `
        UPDATE Cars
        SET isActive = FALSE, updatedAt = NOW()
        WHERE carId = $1
        RETURNING carId AS "carId", isActive AS "isActive"
      `,
      [id],
    );

    if (!archived) {
      notFound('Car not found');
    }

    return { archived: true, car: archived };
  }

  const car = await queryOne('DELETE FROM Cars WHERE carId = $1 RETURNING carId', [id]);
  if (!car) {
    notFound('Car not found');
  }

  return null;
}
