import { query } from '../config/db.js';

export type RevenueFilters = {
  from?: Date;
  to?: Date;
  paymentMethod?: string;
};

export async function currentRentals() {
  return query('SELECT * FROM vw_current_rentals_by_user ORDER BY startDate DESC');
}

export async function popularCars() {
  return query('SELECT * FROM vw_most_popular_cars');
}

export async function overdueRents() {
  return query('SELECT * FROM vw_overdue_rentals ORDER BY expectedEndDate ASC');
}

export async function revenue(filters: RevenueFilters) {
  const values: unknown[] = [];
  const clauses = ["t.status = 'Accepted'"];

  if (filters.from) {
    values.push(filters.from.toISOString());
    clauses.push(`t.createdAt >= $${values.length}`);
  }

  if (filters.to) {
    values.push(filters.to.toISOString());
    clauses.push(`t.createdAt <= $${values.length}`);
  }

  if (filters.paymentMethod) {
    values.push(filters.paymentMethod);
    clauses.push(`t.paymentMethod = $${values.length}`);
  }

  return query(
    `
      SELECT
        DATE(t.createdAt) AS "revenueDate",
        SUM(CASE WHEN t.direction = 'Incoming' THEN t.amount ELSE 0 END)::float AS incoming,
        SUM(CASE WHEN t.direction = 'Outgoing' THEN t.amount ELSE 0 END)::float AS outgoing,
        SUM(CASE WHEN t.direction = 'Incoming' THEN t.amount ELSE -t.amount END)::float AS "netRevenue",
        COUNT(*)::int AS "transactionCount"
      FROM TransactionHistory t
      WHERE ${clauses.join(' AND ')}
      GROUP BY DATE(t.createdAt)
      ORDER BY "revenueDate" DESC
    `,
    values,
  );
}

export async function customerHistory(userId: number) {
  return query(
    `
      SELECT *
      FROM vw_all_rentals_by_user
      WHERE userId = $1
      ORDER BY startDate DESC
    `,
    [userId],
  );
}
