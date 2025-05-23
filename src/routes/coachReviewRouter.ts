import express from "express";
import { CoachReviewModel } from "../models/CoachReview";
import { authenticateToken } from "../middleware/auth";
import mongoose from "mongoose";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coach Reviews
 *   description: API for managing coach reviews and ratings
 */

/**
 * @swagger
 * /coach-reviews:
 *   post:
 *     summary: Create a new review for a coach
 *     tags: [Coach Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coachId
 *               - rating
 *               - comment
 *             properties:
 *               coachId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               categories:
 *                 type: object
 *                 properties:
 *                   professionalism:
 *                     type: number
 *                   communication:
 *                     type: number
 *                   expertise:
 *                     type: number
 *                   valueForMoney:
 *                     type: number
 *               sessionDate:
 *                 type: string
 *                 format: date
 */
router.post("/", authenticateToken, async (req: any, res: any) => {
  try {
    const { coachId, rating, comment, categories, sessionDate } = req.body;
    const reviewerId = req.user.id; // From auth middleware

    // Check if user has already reviewed this coach
    const existingReview = await CoachReviewModel.findOne({
      coach: coachId,
      reviewer: reviewerId
    });

    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this coach" });
    }

    const review = new CoachReviewModel({
      coach: coachId,
      reviewer: reviewerId,
      rating,
      comment,
      categories,
      sessionDate: sessionDate ? new Date(sessionDate) : undefined,
      isVerified: false // Can be updated later if verified
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Failed to create review" });
  }
});

/**
 * @swagger
 * /coach-reviews/coach/{coachId}:
 *   get:
 *     summary: Get all reviews for a specific coach
 *     tags: [Coach Reviews]
 *     parameters:
 *       - in: path
 *         name: coachId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 */
router.get("/coach/:coachId", async (req: any, res: any) => {
  try {
    const { coachId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      CoachReviewModel.find({ coach: coachId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("reviewer", "firstName lastName"),
      CoachReviewModel.countDocuments({ coach: coachId })
    ]);

    const averageRating = await CoachReviewModel.aggregate([
      { $match: { coach: new mongoose.Types.ObjectId(coachId) } },
      { $group: { _id: "$coach", averageRating: { $avg: "$rating" } } }
    ]);

    res.json({
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      averageRating
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/**
 * @swagger
 * /coach-reviews/{reviewId}:
 *   put:
 *     summary: Update a review
 *     tags: [Coach Reviews]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:reviewId", authenticateToken, async (req: any, res: any) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, categories } = req.body;
    const userId = req.user.id;

    const review = await CoachReviewModel.findOne({
      _id: reviewId,
      reviewer: userId
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found or unauthorized" });
    }

    // Update only provided fields
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (categories) review.categories = { ...review.categories, ...categories };

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: "Failed to update review" });
  }
});

/**
 * @swagger
 * /coach-reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Coach Reviews]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:reviewId", authenticateToken, async (req: any, res: any) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await CoachReviewModel.findOne({
      _id: reviewId,
      reviewer: userId
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found or unauthorized" });
    }

    await review.deleteOne();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router; 