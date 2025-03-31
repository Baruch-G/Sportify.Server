import express from "express";
import { CategoryModel } from "../models/Category";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category (child or parent)
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imageURL:
 *                 type: string
 *               popularityScore:
 *                 type: number
 *               difficultyLevel:
 *                 type: number
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post("/", async (req, res) => {
  try {
    const category = new CategoryModel(req.body);
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all non-parent (child) categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of child categories
 */
router.get("/", async (_, res) => {
  try {
    const categories = await CategoryModel.find({ id: { $ne: null } });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put("/:id", async (req, res) => {
  try {
    const updated = await CategoryModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete("/:id", async (req, res) => {
  try {
    await CategoryModel.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
