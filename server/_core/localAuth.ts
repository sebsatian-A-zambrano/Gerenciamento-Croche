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
        console.log("[LocalAuth] Login failed: invalid credentials for user", username);
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

      console.log("[LocalAuth] Login successful for user", username, "with cookie options:", cookieOptions);
      res.json({ success: true, user: { id: user.id, name: user.name } });
    } catch (error) {
      console.error("[LocalAuth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    const { username, password, name } = req.body;

    if (!username || !password || !name) {
      res.status(400).json({ error: "username, password and name are required" });
      return;
    }

    if (username.length < 3) {
      res.status(400).json({ error: "username must be at least 3 characters" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "password must be at least 6 characters" });
      return;
    }

    try {
      const users = loadUsers();
      const usersPath = path.resolve(process.cwd(), "users.json");

      // Check if user already exists
      if (users.some((u) => u.username === username)) {
        res.status(400).json({ error: "Username already exists" });
        return;
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        password, // In production, hash this!
        name,
      };

      users.push(newUser);
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

      // Auto-login after signup
      await db.upsertUser({
        id: newUser.id,
        name: newUser.name,
        email: null,
        loginMethod: "local",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(newUser.id, {
        name: newUser.name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: newUser.id, name: newUser.name } });
    } catch (error) {
      console.error("[LocalAuth] Signup failed", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });
}
