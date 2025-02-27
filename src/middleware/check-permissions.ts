import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const checkPermissions = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log("checkPermissions middleware invoked");
    const authHeader = req.headers["authorization"];
    console.log("Authorization header:", authHeader);

    if (!authHeader) {
      console.error("No token provided in header");
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.error("Token missing after splitting Authorization header");
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    try {
      const secretKey =
        process.env.JWT_SECRET ||
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      console.log("Using secretKey:", secretKey);
      console.log("Token received:", token);
      const decoded = jwt.verify(token, secretKey) as {
        permissions?: string[];
      };
      console.log("Decoded token:", decoded);

      const userPermissions = decoded.permissions || [];
      console.log("User permissions:", userPermissions);

      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      );
      console.log("Has required permission:", hasPermission);

      if (!hasPermission) {
        console.error(
          "User does not have required permissions. Required:",
          requiredPermissions,
          "User:",
          userPermissions
        );
        res.status(403).json({
          error:
            "Forbidden: You do not have permission to access this resource.",
        });
        return;
      }

      console.log("Permission check passed");
      next();
    } catch (err) {
      console.error("Error in checkPermissions middleware:", err);
      res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };
};
