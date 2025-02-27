import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        permissions: string[]; // Define the structure of the user object
      };
    }
  }
}
