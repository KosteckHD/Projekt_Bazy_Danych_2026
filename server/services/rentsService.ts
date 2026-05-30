import { query, queryOne, withTransaction } from '../config/db.js';
import { badRequest, conflict, notFound } from '../handlers/httpError.js';

export type RentInput = {
  userId: number;
  carId: number;
  workerId?: number | null;
  pickupBranchId?: number | null;
  returnBranchId?: number | null;
  startDate: string;
  expectedEndDate: string;
  additionalCost?: number;
  status?: 'Pending' | 'Started';
};

export type RentUpdateInput = Partial<Omit<RentInput, 'userId' | 'carId' | 'status'>> & {
  status?: 'Pending' | 'Cancelled';
};

export type FinishRentInput = {
  endDate?: string;
  additionalCost?: number;
  returnBranchId?: number | null;
  mileage?: number;
  carStatus: 'Available' | 'Maintenance' | 'Damaged';
  paymentMethod?: string;
  createPayment: boolean;
  damageDescription?: string;
  damageRepairCost: number;
};

const rentSelect = `
  SELECT
    r.rentId AS "rentId",
    r.userId AS "userId",
    u.firstName AS "firstName",
    u.lastName AS "lastName",
    r.carId AS "carId",
    c.VIN AS "VIN",
    c.registrationNumber AS "registrationNumber",
    m.modelName AS "modelName",
    b.brandName AS "brandName",
    r.workerId AS "workerId",
    r.pickupBranchId AS "pickupBranchId",
    r.returnBranchId AS "returnBranchId",
    r.startDate AS "startDate",
    r.expectedEndDate AS "expectedEndDate",
    r.endDate AS "endDate",
    r.additionalCost::float AS "additionalCost",
    r.totalCost::float AS "totalCost",
    r.status,
    r.createdAt AS "createdAt",
    r.updatedAt AS "updatedAt"
  FROM Rents r
  JOIN Users u ON u.userId = r.userId
  JOIN Cars c ON c.carId = r.carId
  JOIN Models m ON m.modelId = c.modelId
  JOIN Brands b ON b.brandId = m.brandId
`;

export async function listRents() {
  return query(`${rentSelect} ORDER BY r.startDate DESC`);
}

export async function listCurrentRents() {
  return query('SELECT * FROM vw_current_rentals_by_user ORDER BY startDate DESC');
}

export async function listPendingRents() {
  return query(`${rentSelect} WHERE r.status = 'Pending' ORDER BY r.startDate ASC`);
}

export async function listOverdueRents() {
  return query('SELECT * FROM vw_overdue_rentals ORDER BY expectedEndDate ASC');
}

export async function getRent(id: number) {
  const rent = await queryOne(`${rentSelect} WHERE r.rentId = $1`, [id]);
  if (!rent) {
    notFound('Rent not found');
  }

  return rent;
}

export async function ensureUserCanRent(userId: number): Promise<void> {
  const user = await queryOne<{ role: string; isactive: boolean }>(
    'SELECT role, isActive FROM Users WHERE userId = $1',
    [userId],
  );

  if (!user) {
    notFound('User not found');
  }

  if (user.role === 'Banned' || user.isactive === false) {
    conflict('User cannot create rents');
  }
}

export async function checkAvailability(
  carId: number,
  startDate: string,
  expectedEndDate: string,
  ignoreRentId?: number,
) {
  if (new Date(expectedEndDate) <= new Date(startDate)) {
    badRequest('expectedEndDate must be after startDate');
  }

  const car = await queryOne<{ status: string; isactive: boolean }>(
    'SELECT status, isActive FROM Cars WHERE carId = $1',
    [carId],
  );

  if (!car) {
    notFound('Car not found');
  }

  if (car.isactive === false) {
    return { available: false, reason: 'Car is archived' };
  }

  if (!['Available', 'Rented'].includes(car.status)) {
    return { available: false, reason: `Car status is ${car.status}` };
  }

  const values: unknown[] = [carId, startDate, expectedEndDate];
  let ignoreClause = '';
  if (ignoreRentId) {
    values.push(ignoreRentId);
    ignoreClause = `AND rentId <> $${values.length}`;
  }

  const overlapping = await queryOne<{ rentid: number }>(
    `
      SELECT rentId
      FROM Rents
      WHERE carId = $1
        AND status IN ('Pending', 'Started')
        AND tsrange(startDate, COALESCE(endDate, expectedEndDate), '[)')
            && tsrange($2::timestamp, $3::timestamp, '[)')
        ${ignoreClause}
      LIMIT 1
    `,
    values,
  );

  if (overlapping) {
    return { available: false, reason: 'Car already has a rent in this period' };
  }

  return { available: true };
}

function calculateTotalCost(startDate: Date, endDate: Date, hourlyCost: number, additionalCost: number) {
  const milliseconds = endDate.getTime() - startDate.getTime();
  const hours = Math.max(1, Math.ceil(milliseconds / 3_600_000));
  const baseCost = Number((hours * hourlyCost).toFixed(2));
  const totalCost = Number((baseCost + additionalCost).toFixed(2));

  return { hours, baseCost, additionalCost, totalCost };
}

export async function createRent(input: RentInput) {
  await ensureUserCanRent(input.userId);
  const availability = await checkAvailability(input.carId, input.startDate, input.expectedEndDate);

  if (!availability.available) {
    conflict(availability.reason ?? 'Car is not available');
  }

  return withTransaction(async (client) => {
    const result = await client.query(
      `
        INSERT INTO Rents (
          userId, carId, workerId, pickupBranchId, returnBranchId,
          startDate, expectedEndDate, additionalCost, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
          rentId AS "rentId",
          userId AS "userId",
          carId AS "carId",
          workerId AS "workerId",
          pickupBranchId AS "pickupBranchId",
          returnBranchId AS "returnBranchId",
          startDate AS "startDate",
          expectedEndDate AS "expectedEndDate",
          additionalCost::float AS "additionalCost",
          totalCost::float AS "totalCost",
          status,
          createdAt AS "createdAt",
          updatedAt AS "updatedAt"
      `,
      [
        input.userId,
        input.carId,
        input.workerId ?? null,
        input.pickupBranchId ?? null,
        input.returnBranchId ?? null,
        input.startDate,
        input.expectedEndDate,
        input.additionalCost ?? 0,
        input.status ?? 'Pending',
      ],
    );

    if (input.status === 'Started') {
      await client.query('UPDATE Cars SET status = $1, updatedAt = NOW() WHERE carId = $2', [
        'Rented',
        input.carId,
      ]);
    }

    return result.rows[0];
  });
}

export async function updateRent(id: number, input: RentUpdateInput) {
  const current = await queryOne<{
    status: string;
    carid: number;
    startdate: Date;
    expectedenddate: Date;
  }>('SELECT status, carId, startDate, expectedEndDate FROM Rents WHERE rentId = $1', [id]);

  if (!current) {
    notFound('Rent not found');
  }
  if (current.status === 'Ended') {
    conflict('Ended rent cannot be edited');
  }

  if (input.startDate || input.expectedEndDate) {
    const availability = await checkAvailability(
      current.carid,
      input.startDate ?? current.startdate.toISOString(),
      input.expectedEndDate ?? current.expectedenddate.toISOString(),
      id,
    );

    if (!availability.available) {
      conflict(availability.reason ?? 'Car is not available');
    }
  }

  const allowedFields = {
    workerId: 'workerId',
    pickupBranchId: 'pickupBranchId',
    returnBranchId: 'returnBranchId',
    startDate: 'startDate',
    expectedEndDate: 'expectedEndDate',
    additionalCost: 'additionalCost',
    status: 'status',
  };

  const values: unknown[] = [];
  const assignments: string[] = [];
  for (const [key, column] of Object.entries(allowedFields)) {
    if (Object.prototype.hasOwnProperty.call(input, key) && input[key as keyof RentUpdateInput] !== undefined) {
      values.push(input[key as keyof RentUpdateInput]);
      assignments.push(`${column} = $${values.length}`);
    }
  }

  values.push(new Date());
  assignments.push(`updatedAt = $${values.length}`);
  values.push(id);

  return queryOne(
    `
      UPDATE Rents
      SET ${assignments.join(', ')}
      WHERE rentId = $${values.length}
      RETURNING
        rentId AS "rentId",
        userId AS "userId",
        carId AS "carId",
        workerId AS "workerId",
        pickupBranchId AS "pickupBranchId",
        returnBranchId AS "returnBranchId",
        startDate AS "startDate",
        expectedEndDate AS "expectedEndDate",
        endDate AS "endDate",
        additionalCost::float AS "additionalCost",
        totalCost::float AS "totalCost",
        status,
        updatedAt AS "updatedAt"
    `,
    values,
  );
}

export async function startRent(id: number, workerId?: number | null, startDateInput?: string) {
  return withTransaction(async (client) => {
    const rentResult = await client.query<{
      rentid: number;
      userid: number;
      carid: number;
      startdate: Date;
      expectedenddate: Date;
      status: string;
    }>('SELECT rentId, userId, carId, startDate, expectedEndDate, status FROM Rents WHERE rentId = $1 FOR UPDATE', [
      id,
    ]);

    const current = rentResult.rows[0];
    if (!current) {
      notFound('Rent not found');
    }
    if (current.status !== 'Pending') {
      conflict('Only pending rent can be started');
    }

    await ensureUserCanRent(current.userid);
    const startDate = startDateInput ?? current.startdate.toISOString();
    const availability = await checkAvailability(
      current.carid,
      startDate,
      current.expectedenddate.toISOString(),
      current.rentid,
    );

    if (!availability.available) {
      conflict(availability.reason ?? 'Car is not available');
    }

    const updateResult = await client.query(
      `
        UPDATE Rents
        SET status = 'Started',
            workerId = COALESCE($1, workerId),
            startDate = $2,
            updatedAt = NOW()
        WHERE rentId = $3
        RETURNING rentId AS "rentId", status, startDate AS "startDate", updatedAt AS "updatedAt"
      `,
      [workerId ?? null, startDate, id],
    );

    await client.query('UPDATE Cars SET status = $1, updatedAt = NOW() WHERE carId = $2', [
      'Rented',
      current.carid,
    ]);

    return updateResult.rows[0];
  });
}

export async function finishRent(id: number, input: FinishRentInput) {
  return withTransaction(async (client) => {
    const rentResult = await client.query<{
      rentid: number;
      carid: number;
      startdate: Date;
      additionalcost: string;
      status: string;
      hourlycost: string;
    }>(
      `
        SELECT r.rentId, r.carId, r.startDate, r.additionalCost, r.status, m.hourlyCost
        FROM Rents r
        JOIN Cars c ON c.carId = r.carId
        JOIN Models m ON m.modelId = c.modelId
        WHERE r.rentId = $1
        FOR UPDATE
      `,
      [id],
    );

    const current = rentResult.rows[0];
    if (!current) {
      notFound('Rent not found');
    }
    if (current.status !== 'Started') {
      conflict('Only started rent can be finished');
    }

    const endDate = input.endDate ? new Date(input.endDate) : new Date();
    const additionalCost = input.additionalCost ?? Number(current.additionalcost);
    const cost = calculateTotalCost(current.startdate, endDate, Number(current.hourlycost), additionalCost);

    const rentUpdate = await client.query(
      `
        UPDATE Rents
        SET status = 'Ended',
            endDate = $1,
            additionalCost = $2,
            totalCost = $3,
            returnBranchId = COALESCE($4, returnBranchId),
            updatedAt = NOW()
        WHERE rentId = $5
        RETURNING
          rentId AS "rentId",
          carId AS "carId",
          startDate AS "startDate",
          endDate AS "endDate",
          additionalCost::float AS "additionalCost",
          totalCost::float AS "totalCost",
          status
      `,
      [endDate.toISOString(), additionalCost, cost.totalCost, input.returnBranchId ?? null, id],
    );

    await client.query(
      `
        UPDATE Cars
        SET status = $1,
            mileage = COALESCE($2, mileage),
            branchId = COALESCE($3, branchId),
            updatedAt = NOW()
        WHERE carId = $4
      `,
      [input.carStatus, input.mileage ?? null, input.returnBranchId ?? null, current.carid],
    );

    let payment = null;
    if (input.createPayment) {
      const paymentResult = await client.query(
        `
          INSERT INTO TransactionHistory (
            rentId, status, transactionType, amount, direction, paymentMethod
          )
          VALUES ($1, $2, 'RentalPayment', $3, 'Incoming', $4)
          RETURNING
            transactionId AS "transactionId",
            rentId AS "rentId",
            status,
            transactionType AS "transactionType",
            amount::float AS "amount",
            direction,
            paymentMethod AS "paymentMethod",
            createdAt AS "createdAt"
        `,
        [id, input.paymentMethod ? 'Accepted' : 'Pending', cost.totalCost, input.paymentMethod ?? null],
      );
      payment = paymentResult.rows[0];
    }

    let damageReport = null;
    if (input.damageDescription) {
      const damageResult = await client.query(
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
        [current.carid, id, input.damageDescription, input.damageRepairCost],
      );
      damageReport = damageResult.rows[0];
    }

    return {
      rent: rentUpdate.rows[0],
      cost,
      payment,
      damageReport,
    };
  });
}

export async function deleteRent(id: number) {
  const current = await queryOne<{ status: string; transactioncount: string }>(
    `
      SELECT r.status, COUNT(t.transactionId) AS transactionCount
      FROM Rents r
      LEFT JOIN TransactionHistory t ON t.rentId = r.rentId
      WHERE r.rentId = $1
      GROUP BY r.rentId
    `,
    [id],
  );

  if (!current) {
    notFound('Rent not found');
  }

  if (current.status === 'Pending' && Number(current.transactioncount) === 0) {
    await queryOne('DELETE FROM Rents WHERE rentId = $1 RETURNING rentId', [id]);
    return null;
  }

  if (current.status === 'Pending') {
    return queryOne(
      `
        UPDATE Rents
        SET status = 'Cancelled', updatedAt = NOW()
        WHERE rentId = $1
        RETURNING rentId AS "rentId", status
      `,
      [id],
    );
  }

  conflict('Started or ended rents cannot be deleted');
}
