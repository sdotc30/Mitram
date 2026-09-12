const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Uses your existing DB connection

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get consultants (Filtered by category slug or return all)
router.get("/consultants", async (req, res) => {
  const { category } = req.query;
  try {
    let query = `
      SELECT 
        c.id, 
        c.display_name AS name, 
        c.bio, 
        c.per_minute_rate, 
        c.rating, 
        c.is_online,
        cat.name AS category_name, 
        cat.slug AS category_slug 
      FROM consultants c
      JOIN categories cat ON c.category_id = cat.id
    `;
    let params = [];

    if (category) {
      query += ` WHERE cat.slug = $1`;
      params.push(category);
    }

    query += ` ORDER BY c.rating DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching consultants:", err);
    res.status(500).json({ error: "Failed to fetch consultants" });
  }
});

module.exports = router;
