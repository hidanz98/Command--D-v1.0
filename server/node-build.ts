import { createServer } from "./index";
import express from "express";
import path from "path";

const app = createServer();

// Serve static files from the built SPA
app.use(express.static(path.join(__dirname, "../spa")));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get("*", (req, res) => {
  // Skip API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }
  
  res.sendFile(path.join(__dirname, "../spa/index.html"));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
