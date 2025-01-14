import express from "express";
const router = express.Router();

// GET all events
router.get("/", (req, res) => {
  res.send("Get all events");
});

// GET event by id
router.get("/:id", (req, res) => {
  res.send("Get specifc event");
});

export default router;