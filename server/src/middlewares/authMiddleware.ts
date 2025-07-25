import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/index"; // Import from types file

// Remove the duplicate declare module - it's now in types/index.d.ts

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) return res.sendStatus(403); // Forbidden

    req.user = decoded as JwtPayload;
    next();
  });
};
