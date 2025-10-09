import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";

export const handleDemo: RequestHandler = (req, res) => {
  const response: DemoResponse = {
    message: "Hello from Fusion Starter!",
    timestamp: new Date().toISOString()
  };
  res.json(response);
};
