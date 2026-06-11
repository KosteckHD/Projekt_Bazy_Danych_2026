import { queryOne } from '../config/db.js';
import { conflict, notFound } from '../handlers/httpError.js';

type StaffRow = {
  userid: number;
  role: string;
  branchid: number | null;
  isactive: boolean;
};

export async function ensureBranchStaff(
  staffId: number,
  branchId: number | null,
  action = 'perform this operation',
) {
  const staff = await queryOne<StaffRow>(
    'SELECT userId, role, branchId, isActive FROM Users WHERE userId = $1',
    [staffId],
  );

  if (!staff) {
    notFound('Worker or manager not found');
  }

  if (staff.isactive === false || !['Worker', 'Manager', 'Admin'].includes(staff.role)) {
    conflict(`User cannot ${action}`);
  }

  if (staff.role !== 'Admin' && (!branchId || staff.branchid !== branchId)) {
    conflict(`User cannot ${action} outside their branch`);
  }

  return staff;
}
