const express = require("express");
const path = require("path");
require("dotenv").config();

const pool = require("./src/db/pool");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Test API endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "FigVault server is running!"
  });
});


app.get("/api/db-health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database"
    );

    res.json({
      status: "success",
      message: "Database connected!",
      database: result.rows[0].database
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(500).json({
      status: "error",
      message: "Database connection failed"
    });
  }
});

app.get("/api/figures", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        f.id,
        f.name,
        f.series,
        f.character_name,
        f.manufacturer,
        f.scale,
        f.release_date,
        f.image_url,
        COALESCE(ci.status, 'Wished') AS status
      FROM figures f
      LEFT JOIN collection_items ci
        ON ci.figure_id = f.id
      ORDER BY f.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch figures:", error.message);

    res.status(500).json({
      error: "Failed to retrieve figures"
    });
  }
});

app.post("/api/figures", async (req, res) => {
  const {
    name,
    series,
    character_name,
    manufacturer,
    scale,
    release_date,
    image_url,
    status
  } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      error: "Figure name is required."
    });
  }

  const validStatuses = ["Owned", "Ordered", "Wished"];
  const figureStatus = validStatuses.includes(status) ? status : "Wished";

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const figureResult = await client.query(
      `INSERT INTO figures
        (name, series, character_name, manufacturer, scale, release_date, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name.trim(),
        series || null,
        character_name || null,
        manufacturer || null,
        scale || null,
        release_date || null,
        image_url || null
      ]
    );

    const figure = figureResult.rows[0];

    await client.query(
      `INSERT INTO collection_items (figure_id, status)
       VALUES ($1, $2)`,
      [figure.id, figureStatus]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Figure added successfully.",
      figure: {
        ...figure,
        status: figureStatus
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to add figure:", error.message);

    res.status(500).json({
      error: "Failed to add figure."
    });
  } finally {
    client.release();
  }
});


app.patch("/api/figures/:id/status", async (req, res) => {
  const figureId = Number(req.params.id);
  const { status } = req.body;

  const validStatuses = ["Owned", "Ordered", "Wished"];

  if (!Number.isInteger(figureId) || figureId <= 0) {
    return res.status(400).json({ error: "Invalid figure ID." });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status." });
  }

  try {
    const result = await pool.query(
      `UPDATE collection_items
       SET status = $1
       WHERE figure_id = $2
       RETURNING figure_id, status`,
      [status, figureId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Collection entry not found."
      });
    }

    res.json({
      message: "Status updated successfully.",
      figureId,
      status
    });
  } catch (error) {
    console.error("Failed to update figure status:", error.message);
    res.status(500).json({ error: "Failed to update status." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`FigVault is running at http://localhost:${PORT}`);
});
