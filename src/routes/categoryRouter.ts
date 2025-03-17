import express  from "express";
import { CategoryModel } from "../models/Category";


/**
 * @swagger
 * tags:
 *      name: Categories
 *      description: API for managing Categories
 * 
 */


const router=express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   name:
 *                     type: string
 *                     example: "Running"
 *                   description:
 *                     type: string
 *                     example: "Events related to running"
 *                   imageURL:
 *                     type: string
 *                     example: "https://example.com/running.jpg"
 */
router.get("/", async (req: any, res: any) => {
    try {
      const categories = await CategoryModel.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  /**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 name:
 *                   type: string
 *                   example: "Yoga"
 *                 description:
 *                   type: string
 *                   example: "All yoga-related events"
 *                 imageURL:
 *                   type: string
 *                   example: "https://example.com/yoga.jpg"
 *       404:
 *         description: Category not found
 */
router.get("/:id", async (req: any, res: any) => {
    try {
      const category = await CategoryModel.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });
  
  

  /**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
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
 *                 example: "Yoga"
 *               description:
 *                 type: string
 *                 example: "All yoga-related events"
 *               imageURL:
 *                 type: string
 *                 example: "https://example.com/yoga.jpg"
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", async (req: any, res: any) => {
    try {
      const { name, description, imageURL } = req.body;
      const category = new CategoryModel({ name, description, imageURL });
      await category.save();
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: "Failed to create category" });
    }
  });



/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
router.delete("/:id", async (req: any, res: any) => {
    try {
      const deletedCategory = await CategoryModel.findByIdAndDelete(req.params.id);
      if (!deletedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });


export default router;