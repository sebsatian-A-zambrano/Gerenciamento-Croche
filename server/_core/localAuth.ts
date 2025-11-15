import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

interface User {
  id: string;
  username: string;
  password: string;
  name: string;
}

function loadUsers(): User[] {
  try {
    const usersPath = path.resolve(process.cwd(), "users.json");
    if (!fs.existsSync(usersPath)) {
      return [];
    }
    const data = fs.readFileSync(usersPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("[LocalAuth] Error loading users:", error);
    return [];
  }
}

export function registerLocalAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "username and password are required" });
      return;
    }

    try {
      const users = loadUsers();
      const user = users.find((u) => u.username === username && u.password === password);

      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Upsert user in database (or just create session)
      await db.upsertUser({
        id: user.id,
        name: user.name,
        email: null,
        loginMethod: "local",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(user.id, {
        name: user.name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: user.id, name: user.name } });
    } catch (error) {
      console.error("[LocalAuth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
