import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import { logger } from "./utils/logger";
import { messageQueue, sendScheduledMessages } from "./queues";

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_FRONTEND_URL];
      if (allowedOrigins.indexOf(origin) === -1) {
        // Fallback: If not matched, we can log it or choose to allow it for now
        // For EasyPanel deployment safety, let's trust the configured FRONTEND_URL
        // But if it fails, it might be a protocol mismatch (http vs https)
        console.log(`[CORS] Request from origin: ${origin}`);
        console.log(`[CORS] Allowed Configured: ${process.env.FRONTEND_URL}`);
        
        // Critical Fix: If origin matches the hosting domain but maybe protocol differs or something
        // let's be generous if it matches the domain part.
        // For now, let's STRICTLY respect FRONTEND_URL but ensure it's set on EasyPanel
        
        // DEBUG: Allow all for a moment to prove connectivity if user messed up ENV
        // callback(null, true); 
        
        // PRODUCTION MODE:
        if (origin === process.env.FRONTEND_URL) {
            callback(null, true);
        } else {
             // To fix the user's specific issue where he might have a trailing slash or typo
             // Let's rely on the Env Var being 100% match. 
             // If USER set FRONTEND_URL=https://site.com/ (with slash), it fails matching https://site.com
             const cleanOrigin = origin.replace(/\/$/, "");
             const cleanFrontend = (process.env.FRONTEND_URL || "").replace(/\/$/, "");

             if (cleanOrigin === cleanFrontend) {
                 callback(null, true);
             } else {
                 // Final Fallback for debugging - remove in strict prod
                 console.log("[CORS] BLOCKING REQUEST");
                 callback(new Error('Not allowed by CORS'), false);
             }
        }
      } else {
        callback(null, true);
      }
    }
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
