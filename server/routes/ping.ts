import { RequestHandler } from "express";

export const handlePing: RequestHandler = (req, res) => {
  res.json({ message: "pong", timestamp: new Date().toISOString() });
};
