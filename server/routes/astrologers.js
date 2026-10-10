const express = require("express");
const router = express.Router();

// Mock database data (replace with your MongoDB/PostgreSQL model query if using a DB)
const astrologersData = [
  {
    id: "astro-1",
    name: "Dr. Aravind Shastri",
    title: "Vedic Astrology & Relationship Expert",
    category: "love",
    rating: 4.9,
    reviews: 320,
    price: 499,
    status: "Available Now",
    tags: ["Love & Compatibility", "Vedic Astrology", "Kundli Matching"],
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "astro-2",
    name: "Meera Kapoor",
    title: "Tarot Card Reader & Soulmate Guide",
    category: "love",
    rating: 4.8,
    reviews: 215,
    price: 399,
    status: "Available Now",
    tags: ["Tarot Reading", "Relationship Sync", "Emotional Healing"],
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "astro-3",
    name: "Acharya Vikram",
    title: "Numerologist & Synastry Specialist",
    category: "love",
    rating: 4.95,
    reviews: 450,
    price: 599,
    status: "Busy",
    tags: ["Numerology", "Synastry", "Marriage Compatibility"],
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
  },
];

// GET /api/astrologers?category=love
router.get("/astrologers", (req, res) => {
  try {
    const { category } = req.query;
    let results = astrologersData;

    if (category) {
      results = results.filter(
        (astro) => astro.category.toLowerCase() === category.toLowerCase(),
      );
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching astrologers:", error);
    return res
      .status(500)
      .json({ error: "Failed to retrieve astrologers data" });
  }
});

module.exports = router;
