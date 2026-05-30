import bcrypt from 'bcryptjs';
import { query, queryOne } from '../config/db.js';
import { buildUpdateSet } from '../config/sql.js';
import { notFound } from '../handlers/httpError.js';

export type UserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: string;
  driverLicenseNumber?: string | null;
  driverLicenseExpiresAt?: string | null;
  birthDate?: string | null;
  address?: string | null;
};

export type UserUpdateInput = Omit<Partial<UserInput>, 'password'> & {
  isActive?: boolean;
};

const userSelect = `
  SELECT
    userId AS "userId",
    email,
    firstName AS "firstName",
    lastName AS "lastName",
    phone,
    role,
    driverLicenseNumber AS "driverLicenseNumber",
    driverLicenseExpiresAt AS "driverLicenseExpiresAt",
    birthDate AS "birthDate",
    address,
    isActive AS "isActive",
    createdAt AS "createdAt",
    updatedAt AS "updatedAt"
  FROM Users
`;

export async function listUsers() {
  return query(`${userSelect} ORDER BY createdAt DESC`);
}

export async function getUser(id: number) {
  const user = await queryOne(`${userSelect} WHERE userId = $1`, [id]);
  if (!user) {
    notFound('User not found');
  }

  return user;
}

export async function listUserRents(id: number) {
  return query(
    `
      SELECT
        r.rentId AS "rentId",
        r.carId AS "carId",
        c.VIN AS "VIN",
        m.modelName AS "modelName",
        b.brandName AS "brandName",
        r.startDate AS "startDate",
        r.expectedEndDate AS "expectedEndDate",
        r.endDate AS "endDate",
        r.additionalCost::float AS "additionalCost",
        r.totalCost::float AS "totalCost",
        r.status
      FROM Rents r
      JOIN Cars c ON c.carId = r.carId
      JOIN Models m ON m.modelId = c.modelId
      JOIN Brands b ON b.brandId = m.brandId
      WHERE r.userId = $1
      ORDER BY r.startDate DESC
    `,
    [id],
  );
}

export async function createUser(input: UserInput) {
  const passwordHash = await bcrypt.hash(input.password, 12);

  return queryOne(
    `
      INSERT INTO Users (
        email, passwordHash, firstName, lastName, phone, role,
        driverLicenseNumber, driverLicenseExpiresAt, birthDate, address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        userId AS "userId",
        email,
        firstName AS "firstName",
        lastName AS "lastName",
        phone,
        role,
        driverLicenseNumber AS "driverLicenseNumber",
        driverLicenseExpiresAt AS "driverLicenseExpiresAt",
        birthDate AS "birthDate",
        address,
        isActive AS "isActive",
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
    `,
    [
      input.email,
      passwordHash,
      input.firstName,
      input.lastName,
      input.phone,
      input.role ?? 'Customer',
      input.driverLicenseNumber ?? null,
      input.driverLicenseExpiresAt ?? null,
      input.birthDate ?? null,
      input.address ?? null,
    ],
  );
}

export async function updateUser(id: number, input: UserUpdateInput) {
  const values: unknown[] = [];
  const setClause = buildUpdateSet(
    input,
    {
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      phone: 'phone',
      role: 'role',
      driverLicenseNumber: 'driverLicenseNumber',
      driverLicenseExpiresAt: 'driverLicenseExpiresAt',
      birthDate: 'birthDate',
      address: 'address',
      isActive: 'isActive',
    },
    values,
  );

  values.push(id);
  const user = await queryOne(
    `
      UPDATE Users
      SET ${setClause}
      WHERE userId = $${values.length}
      RETURNING
        userId AS "userId",
        email,
        firstName AS "firstName",
        lastName AS "lastName",
        phone,
        role,
        driverLicenseNumber AS "driverLicenseNumber",
        driverLicenseExpiresAt AS "driverLicenseExpiresAt",
        birthDate AS "birthDate",
        address,
        isActive AS "isActive",
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
    `,
    values,
  );

  if (!user) {
    notFound('User not found');
  }

  return user;
}

export async function updateUserRole(id: number, role: string) {
  const user = await queryOne(
    `
      UPDATE Users
      SET role = $1, updatedAt = NOW()
      WHERE userId = $2
      RETURNING userId AS "userId", role, updatedAt AS "updatedAt"
    `,
    [role, id],
  );

  if (!user) {
    notFound('User not found');
  }

  return user;
}

export async function updatePassword(id: number, password: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await queryOne(
    `
      UPDATE Users
      SET passwordHash = $1, updatedAt = NOW()
      WHERE userId = $2
      RETURNING userId AS "userId", updatedAt AS "updatedAt"
    `,
    [passwordHash, id],
  );

  if (!user) {
    notFound('User not found');
  }

  return user;
}

export async function deleteUser(id: number) {
  const usage = await queryOne<{ count: string }>(
    'SELECT COUNT(*) AS count FROM Rents WHERE userId = $1',
    [id],
  );

  if (Number(usage?.count ?? 0) > 0) {
    const user = await queryOne(
      `
        UPDATE Users
        SET isActive = FALSE, role = 'Banned', updatedAt = NOW()
        WHERE userId = $1
        RETURNING userId AS "userId", isActive AS "isActive", role
      `,
      [id],
    );

    if (!user) {
      notFound('User not found');
    }

    return { deactivated: true, user };
  }

  const user = await queryOne('DELETE FROM Users WHERE userId = $1 RETURNING userId', [id]);
  if (!user) {
    notFound('User not found');
  }

  return null;
}
