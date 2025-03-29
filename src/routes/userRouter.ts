import express from "express";
import { UserModel } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {EventModel} from "../models/Event";
const router = express.Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - age
 *               - gender
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "securepassword123"
 *               age:
 *                 type: number
 *                 example: 22
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: "male"
 *               wheight:
 *                 type: number
 *                 example: 75
 *               height:
 *                 type: number
 *                 example: 180
 *               fitnessGoal:
 *                 type: string
 *                 example: "Lose weight"
 *               activityLevel:
 *                 type: string
 *                 enum: [low, moderate, high]
 *                 example: "moderate"
 *               sportsInterests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Running", "Yoga"]
 *               favoriteCategoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["c76c0d4f-4356-4960-a7e7-b8887682e69e", "1b34c044-df21-4d00-b67c-9f6b5e62aa0a"]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */

router.post("/register", async (req: any, res: any) => {
  try {
    const {
      username,
      email,
      password,
      age,
      gender,
      wheight,
      height,
      fitnessGoal,
      activityLevel,
      sportsInterests,
      favoriteCategoryIds,
    } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = new UserModel({
      username,
      email,
      password,
      age,
      gender,
      wheight,
      height,
      fitnessGoal,
      activityLevel,
      sportsInterests,
      favoriteCategoryIds,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to register user!!!" });
  }
});


/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user and get a token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "securepassword123"
 *     responses:
 *       200:
 *         description: Login successful, returns a token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // יצירת טוקן
    const token = jwt.sign({ id: user._id, role: user.role }, "your_secret_key", { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *   
 *     responses:
 *       200:
 *         description: List of users 
 *       404:
 *         description: Error fetching users
 */
router.get("/",async(req:any,res:any)=>{
  try{
    const users= await UserModel.find()
    res.status(200).json(users)
  }catch(error){
    res.status(500).json({ error: "Failed to fetch user" });
  }
})



/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get("/:id", async (req: any, res: any) => {
  try {
    const user = await UserModel.findById(req.params.id).select("-password"); // לא להחזיר את הסיסמה
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});


export default router;
