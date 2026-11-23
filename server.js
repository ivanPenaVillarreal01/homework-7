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

app.get("/api/customers", async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const offset = Number(req.query.offset ?? 0);

    if (!Number.isInteger(limit) || limit < 1 ||
        !Number.isInteger(offset) || offset < 0) {
      return res.status(400).json({
        error: "Invalid limit or offset"
      });
    }

    const result = await db.query(
      "SELECT * FROM customers ORDER BY id LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve customers"
    });
  }
});

app.get("/api/sales/revenue", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT sum(saleamount) FROM sales"
    );

    res.json({
      totalRevenue: Number(result.rows[0].sum ?? 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve total revenue"
    });
  }
});

app.get("/api/sales", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT products.name, sales.quantity, sales.saleamount
      FROM sales
      LEFT JOIN products
        ON sales.productid = products.id
      ORDER BY sales.id ASC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve sales"
    });
  }
});

app.get("/api/orders/count", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT count(quantity) FROM orders"
    );

    res.json({
      totalOrders: Number(result.rows[0].count)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve orders"
    });
  }
});

app.get("/api/alerts/issues/count", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT count(id) FROM alerts WHERE type = 'issues'"
    );

    res.json({
      totalIssues: Number(result.rows[0].count)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve issues count"
    });
  }
});

app.get("/api/alerts/issues", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM alerts WHERE type = 'issues'"
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve issues"
    });
  }
});

app.get("/api/alerts/notifications/count", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT count(id) FROM alerts WHERE type = 'notifications'"
    );

    res.json({
      totalNotifications: Number(result.rows[0].count)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve notifications count"
    });
  }
});

app.get("/api/alerts/notifications", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM alerts WHERE type = 'notifications'"
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve notifications"
    });
  }
});

app.get("/api/alerts/tasks", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM alerts WHERE type = 'tasks'"
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve tasks"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});