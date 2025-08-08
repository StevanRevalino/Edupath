// Define your interfaces
export interface User {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: "ADMIN" | "STUDENT";
  kelas?: number | null;
}

export interface JwtPayload {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  kelas?: number | null;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // Use JwtPayload since that's what JWT contains
    }
  }
}

export {};
