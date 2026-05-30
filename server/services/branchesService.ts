import { query, queryOne } from '../config/db.js';
import { buildUpdateSet } from '../config/sql.js';
import { notFound } from '../handlers/httpError.js';

export type BranchInput = {
  branchName: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
};

const branchSelect = `
  SELECT
    branchId AS "branchId",
    branchName AS "branchName",
    address,
    phone,
    email,
    isActive AS "isActive",
    createdAt AS "createdAt",
    updatedAt AS "updatedAt"
  FROM Branches
`;

export async function listBranches() {
  return query(`${branchSelect} ORDER BY branchName ASC`);
}

export async function getBranch(id: number) {
  const branch = await queryOne(`${branchSelect} WHERE branchId = $1`, [id]);
  if (!branch) {
    notFound('Branch not found');
  }

  return branch;
}

export async function listBranchCars(id: number) {
  return query('SELECT * FROM vw_available_cars WHERE branchId = $1', [id]);
}

export async function createBranch(input: BranchInput) {
  return queryOne(
    `
      INSERT INTO Branches (branchName, address, phone, email, isActive)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        branchId AS "branchId",
        branchName AS "branchName",
        address,
        phone,
        email,
        isActive AS "isActive",
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
    `,
    [input.branchName, input.address, input.phone ?? null, input.email ?? null, input.isActive ?? true],
  );
}

export async function updateBranch(id: number, input: Partial<BranchInput>) {
  const values: unknown[] = [];
  const setClause = buildUpdateSet(
    input,
    {
      branchName: 'branchName',
      address: 'address',
      phone: 'phone',
      email: 'email',
      isActive: 'isActive',
    },
    values,
  );

  values.push(id);
  const branch = await queryOne(
    `
      UPDATE Branches
      SET ${setClause}
      WHERE branchId = $${values.length}
      RETURNING
        branchId AS "branchId",
        branchName AS "branchName",
        address,
        phone,
        email,
        isActive AS "isActive",
        updatedAt AS "updatedAt"
    `,
    values,
  );

  if (!branch) {
    notFound('Branch not found');
  }

  return branch;
}

export async function deleteBranch(id: number) {
  const usage = await queryOne<{ count: string }>(
    'SELECT COUNT(*) AS count FROM Cars WHERE branchId = $1 AND isActive = TRUE',
    [id],
  );

  if (Number(usage?.count ?? 0) > 0) {
    const branch = await queryOne(
      `
        UPDATE Branches
        SET isActive = FALSE, updatedAt = NOW()
        WHERE branchId = $1
        RETURNING branchId AS "branchId", isActive AS "isActive"
      `,
      [id],
    );

    if (!branch) {
      notFound('Branch not found');
    }

    return { deactivated: true, branch };
  }

  const branch = await queryOne('DELETE FROM Branches WHERE branchId = $1 RETURNING branchId', [id]);
  if (!branch) {
    notFound('Branch not found');
  }

  return null;
}
