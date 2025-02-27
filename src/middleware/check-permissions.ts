import { Request, Response, NextFunction } from "express";

export const checkPermissions = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Example permission check logic
  const userPermissions = req.user?.permissions || []; // Assuming user permissions are attached to the request

  const requiredPermissions = ["READ_TASKS", "UPLOAD_FILES"]; // Define required permissions for the endpoints

  const hasPermission = requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasPermission) {
    res
      .status(403)
      .json({
        error: "Forbidden: You do not have permission to access this resource.",
      });
    return; // Ensure to return after sending the response
  }

  next();
};
