import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";

interface JwtPayload {
  id: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    console.log("token", token);
    if (!token) {
      res.status(401).json({ error: "Access token is required" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret_key"
    ) as JwtPayload;
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    next(error);
  }
};

export const authorizeRoles = (...roles: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // const hasRole = roles.some((role) => req.user.roles.includes(role));
    // if (!hasRole) {
    //   res.status(403).json({ error: "Insufficient permissions" });
    //   return;
    // }

    next();
  };
};
