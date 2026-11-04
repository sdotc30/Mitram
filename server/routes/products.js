const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /api/products - Fetch all remedies/gemstones or filter by category
router.get("/", async (req, res) => {
  const { category } = req.query;

  try {
    let query = "SELECT * FROM products";
    let values = [];

    if (category && category !== "All") {
      query += " WHERE LOWER(category) = LOWER($1)";
      values.push(category);
    }

    query += " ORDER BY rating DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching store products:", err);
    res.status(500).json({ error: "Server error while fetching store items" });
  }
});

module.exports = router;
