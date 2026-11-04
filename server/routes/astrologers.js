const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /api/astrologers - Fetch all astrologers or filter by category code (e.g. ?category=KUNDLI)[cite: 4]
router.get("/", async (req, res) => {
  const { category } = req.query;

  try {
    let query = "SELECT * FROM astrologers";
    let values = [];

    if (category) {
      // Checks if the requested category code exists inside the astrologer's categories array[cite: 4]
      query += " WHERE $1 = ANY(categories)";
      values.push(category.toUpperCase());
    }

    query += " ORDER BY rating DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching astrologers from database:", err);
    res.status(500).json({ error: "Server error while fetching astrologers" });
  }
});

// GET /api/astrologers/:id - Fetch individual astrologer profile with mapped specialties and reviews
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM astrologers WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Astrologer not found" });
    }

    const astrologer = result.rows[0];

    // Map expertise array to specialties format for UI
    const specialties = astrologer.expertise
      ? astrologer.expertise.map((exp, idx) => ({
          id: idx + 1,
          title: exp,
          description: `Specialized guidance and astrological remedies for ${exp.toLowerCase()}.`,
        }))
      : [];

    res.json({
      ...astrologer,
      bio:
        astrologer.bio ||
        `Practicing Vedic astrologer with over ${astrologer.experience || "8+"} years of experience, helping individuals find clarity and direction in their lives through authentic Vedic wisdom.`,
      specialties,
      reviews: [
        {
          id: 1,
          user_name: "Ananya R.",
          rating: 5,
          comment:
            "The session was very insightful. I got the clarity I needed for my career path. Highly recommended!",
          reply_text: `Thank you Ananya. Wishing you the very best on your journey! ✨`,
          helpful_count: 12,
          created_at: "2 days ago",
        },
        {
          id: 2,
          user_name: "Rohit S.",
          rating: 4,
          comment:
            "Very calm and supportive approach. Guidance really helped me during a difficult phase.",
          reply_text: `Glad to know it was helpful, Rohit. Stay positive and keep moving forward.`,
          helpful_count: 8,
          created_at: "1 week ago",
        },
      ],
    });
  } catch (err) {
    console.error("Error fetching individual astrologer:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching astrologer profile" });
  }
});

module.exports = router;
