import { query, queryOne, withTransaction } from '../config/db.js';
import { badRequest, conflict, notFound } from '../handlers/httpError.js';
import { ensureBranchStaff } from './branchStaffService.js';

export type RentInput = {
  userId?: number;
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
  staffId: number;
  endDate?: string;
  additionalCost?: number;
  lateFee?: number;
  returnBranchId?: number | null;
  mileage?: number;
  carStatus: 'Available' | 'Maintenance' | 'Damaged';
  paymentMethod?: string;
  createPayment: boolean;
  damageDescription?: string;
  damageRepairCost: number;
};

export type CancelNoShowInput = {
  staffId: number;
  cancellationFee?: number;
  paymentMethod?: string;
};

const rentSelect = `
  SELECT
    r.rentId AS "rentId",
    r.userId AS "userId",
    u.firstName AS "firstName",
    u.lastName AS "lastName",
    u.email AS "email",
    r.carId AS "carId",
    c.VIN AS "VIN",
    c.registrationNumber AS "registrationNumber",
    c.imageUrl AS "imageUrl",
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
    m.hourlyCost::float AS "hourlyCost",
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

export async function listMyRents(userId: number) {
  return query(`${rentSelect} WHERE r.userId = $1 ORDER BY r.startDate DESC`, [userId]);
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
  const start = new Date(startDate);
  const end = new Date(expectedEndDate);
  const now = new Date();

  if (start.getTime() < now.getTime() - 10 * 60 * 1000) {
    badRequest('Niepoprawna data: data rozpoczęcia wynajmu nie może być w przeszłości.');
  }

  if (end.getTime() - start.getTime() < 60 * 60 * 1000) {
    badRequest('Niepoprawny okres: minimalny okres wynajmu to 1 godzina.');
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

  const overlapping = await queryOne<{ rentid: number; startdate: Date; enddate: Date }>(
    `
      SELECT 
        rentId AS "rentid", 
        startDate AS "startdate", 
        COALESCE(endDate, expectedEndDate) AS "enddate"
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
    const formatDate = (date: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      const y = date.getFullYear();
      const m = pad(date.getMonth() + 1);
      const d = pad(date.getDate());
      const hh = pad(date.getHours());
      const mm = pad(date.getMinutes());
      return `${y}-${m}-${d} ${hh}:${mm}`;
    };

    const startFmt = formatDate(new Date(overlapping.startdate));
    const endFmt = formatDate(new Date(overlapping.enddate));
    return { 
      available: false, 
      reason: `Pojazd jest już zarezerwowany/wynajęty w okresie od ${startFmt} do ${endFmt}.` 
    };
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
  if (!input.userId) {
    badRequest('userId is required');
  }

  await ensureUserCanRent(input.userId);
  const car = await queryOne<{ branchid: number | null }>(
    'SELECT branchId FROM Cars WHERE carId = $1',
    [input.carId],
  );
  if (!car) {
    notFound('Car not found');
  }

  const pickupBranchId = input.pickupBranchId ?? car.branchid;
  if (!pickupBranchId) {
    conflict('Car must be assigned to a branch before rent can be created');
  }
  if (car.branchid !== pickupBranchId) {
    conflict('Car is not available in selected pickup branch');
  }

  const availability = await checkAvailability(input.carId, input.startDate, input.expectedEndDate);

  if (!availability.available) {
    conflict(availability.reason ?? 'Car is not available');
  }

  if (input.status === 'Started') {
    if (!input.workerId) {
      conflict('Worker or manager is required to start rent');
    }
    await ensureBranchStaff(input.workerId, pickupBranchId, 'start rent');
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
        pickupBranchId,
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

export async function startRent(id: number, workerId: number, startDateInput?: string) {
  return withTransaction(async (client) => {
    const rentResult = await client.query<{
      rentid: number;
      userid: number;
      carid: number;
      pickupbranchid: number | null;
      startdate: Date;
      expectedenddate: Date;
      status: string;
    }>(
      'SELECT rentId, userId, carId, pickupBranchId, startDate, expectedEndDate, status FROM Rents WHERE rentId = $1 FOR UPDATE',
      [id],
    );

    const current = rentResult.rows[0];
    if (!current) {
      notFound('Rent not found');
    }
    if (current.status !== 'Pending') {
      conflict('Only pending rent can be started');
    }

    await ensureUserCanRent(current.userid);
    await ensureBranchStaff(workerId, current.pickupbranchid, 'start rent');

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
      [workerId, startDate, id],
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
      carbranchid: number | null;
      returnbranchid: number | null;
      startdate: Date;
      expectedenddate: Date;
      additionalcost: string;
      status: string;
      hourlycost: string;
    }>(
      `
        SELECT
          r.rentId,
          r.carId,
          c.branchId AS carBranchId,
          r.returnBranchId,
          r.startDate,
          r.expectedEndDate,
          r.additionalCost,
          r.status,
          m.hourlyCost
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

    let endDate = input.endDate ? new Date(input.endDate) : new Date();
    if (endDate < current.startdate) {
      endDate = new Date(current.startdate.getTime() + 1000);
    }
    const returnBranchId = input.returnBranchId ?? current.returnbranchid ?? current.carbranchid;
    await ensureBranchStaff(input.staffId, returnBranchId, 'finish rent');

    const lateFee = endDate > current.expectedenddate ? input.lateFee ?? 0 : 0;
    const additionalCost = (input.additionalCost ?? Number(current.additionalcost)) + lateFee;
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
      [endDate.toISOString(), additionalCost, cost.totalCost, returnBranchId ?? null, id],
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
      [input.carStatus, input.mileage ?? null, returnBranchId ?? null, current.carid],
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
      cost: { ...cost, lateFee },
      payment,
      damageReport,
    };
  });
}

export async function cancelNoShowRent(id: number, input: CancelNoShowInput) {
  return withTransaction(async (client) => {
    const rentResult = await client.query<{
      rentid: number;
      carid: number;
      pickupbranchid: number | null;
      status: string;
    }>('SELECT rentId, carId, pickupBranchId, status FROM Rents WHERE rentId = $1 FOR UPDATE', [id]);

    const current = rentResult.rows[0];
    if (!current) {
      notFound('Rent not found');
    }
    if (current.status !== 'Pending') {
      conflict('Only pending rent can be cancelled as no-show');
    }

    await ensureBranchStaff(input.staffId, current.pickupbranchid, 'cancel no-show rent');

    const rentUpdate = await client.query(
      `
        UPDATE Rents
        SET status = 'Cancelled',
            workerId = $1,
            additionalCost = additionalCost + $2,
            updatedAt = NOW()
        WHERE rentId = $3
        RETURNING
          rentId AS "rentId",
          carId AS "carId",
          workerId AS "workerId",
          additionalCost::float AS "additionalCost",
          status,
          updatedAt AS "updatedAt"
      `,
      [input.staffId, input.cancellationFee ?? 0, id],
    );

    await client.query('UPDATE Cars SET status = $1, updatedAt = NOW() WHERE carId = $2', [
      'Available',
      current.carid,
    ]);

    let payment = null;
    if ((input.cancellationFee ?? 0) > 0) {
      const paymentResult = await client.query(
        `
          INSERT INTO TransactionHistory (
            rentId, status, transactionType, amount, direction, paymentMethod
          )
          VALUES ($1, $2, 'Penalty', $3, 'Incoming', $4)
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
        [
          id,
          input.paymentMethod ? 'Accepted' : 'Pending',
          input.cancellationFee,
          input.paymentMethod ?? null,
        ],
      );
      payment = paymentResult.rows[0];
    }

    return {
      rent: rentUpdate.rows[0],
      payment,
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
