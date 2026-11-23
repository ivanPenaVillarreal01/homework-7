import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test database connection
db.query("SELECT NOW()")
  .then((result) => {
    console.log("PostgreSQL connected successfully!");
    console.log(result.rows[0]);
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
  });

const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("index.html", {
    root: process.cwd()
  });
});

app.get("/api/customers/count", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT count(*) FROM customers"
    );

    res.json({
      totalCustomers: Number(result.rows[0].count)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve customers"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});