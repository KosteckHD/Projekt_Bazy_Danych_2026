import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne } from '../config/db.js';
import { conflict, unauthorized } from '../handlers/httpError.js';

const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? '8h') as NonNullable<jwt.SignOptions['expiresIn']>;

type LoginRow = {
  userid: number;
  email: string;
  passwordhash: string;
  firstname: string;
  lastname: string;
  role: string;
  branchid: number | null;
  isactive: boolean;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  branchId: number | null;
};

export async function login(email: string, password: string) {
  const user = await queryOne<LoginRow>(
    `
      SELECT
        userId,
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        branchId,
        isActive
      FROM Users
      WHERE email = $1
    `,
    [email.toLowerCase()],
  );

  if (!user || user.isactive === false || user.role === 'Banned') {
    unauthorized('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordhash);
  if (!passwordMatches) {
    unauthorized('Invalid email or password');
  }

  const payload: JwtPayload = {
    sub: String(user.userid),
    email: user.email,
    role: user.role,
    branchId: user.branchid,
  };

  const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

  return {
    token,
    user: {
      userId: user.userid,
      email: user.email,
      firstName: user.firstname,
      lastName: user.lastname,
      role: user.role,
      branchId: user.branchid,
    },
  };
}

export function verifyToken(token: string): JwtPayload {
  const payload = jwt.verify(token, jwtSecret);

  if (typeof payload === 'string' || !payload.sub || !payload.email || !payload.role) {
    conflict('Invalid token');
  }

  return payload as JwtPayload;
}
