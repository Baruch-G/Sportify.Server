import express from "express";
import { IUser, UserModel } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EventModel } from "../models/Event";
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
      firstName,
      lastName,
      aboutMe,
      address,
      location,
      roles,
      isCoach,
    } = req.body;

    // Validate required fields
    if (!username || !email || !password || !age || !gender) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["username", "email", "password", "age", "gender"],
        received: {
          username: !!username,
          email: !!email,
          password: !!password,
          age: !!age,
          gender: !!gender,
        },
      });
    }

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
      firstName,
      lastName,
      aboutMe,
      address,
      location,
      roles,
      isCoach,
    });

    console.log("Attempting to save user:", {
      username,
      email,
      age,
      gender,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error: any) {
    console.error("Registration error details:", error);

    // Check if it's a MongoDB validation error
    if (error.name === "ValidationError" && error.errors) {
      return res.status(400).json({
        error: "Validation Error",
        details: Object.values(error.errors).map((err: any) => err.message),
      });
    }

    // Check if it's a MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Duplicate field error",
        details: error.keyPattern,
      });
    }

    res.status(400).json({
      error: "Failed to register user",
      details: error.message || "Unknown error occurred",
    });
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

    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      "your_secret_key",
      { expiresIn: "1m" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * @swagger
 * /users/authenticate:
 *   post:
 *     summary: Authenticate user using a JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "your_jwt_token"
 *     responses:
 *       200:
 *         description: Token is valid, returns user details
 *       401:
 *         description: Invalid or expired token
 */
router.post("/authenticate", async (req: any, res: any) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: "Token is required" });
    }

    jwt.verify(token, "your_secret_key", async (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      const user = await UserModel.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "Token is valid", user });
    });
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
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
router.get("/", async (req: any, res: any) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

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
    const user: IUser = await UserModel.findById(req.params.id).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User ID being searched:", req.params.id);

    // Try to find events by either ObjectId or string ID
    const events = await EventModel.find({
      $or: [
        { organizer: req.params.id },
        { organizer: req.params.id.toString() },
      ],
    }).populate("category");

    console.log("Found events:", events.length);

    // Convert events to plain objects and assign to user
    const plainEvents = events.map((event) => {
      const plainEvent = event.toObject();
      // Handle populated category
      if (
        plainEvent.category &&
        typeof plainEvent.category === "object" &&
        "toObject" in plainEvent.category
      ) {
        plainEvent.category = plainEvent.category.toObject();
      }
      return plainEvent;
    });

    // Create response object with user data and events
    const responseData = {
      ...user.toObject(),
      events: plainEvents,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching user or events:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.put("/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      age,
      gender,
      wheight,
      height,
      fitnessGoal,
      activityLevel,
      sportsInterests,
      firstName,
      lastName,
      aboutMe,
      address,
      location,
      roles,
      isCoach,
    } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        username,
        email,
        age,
        gender,
        wheight,
        height,
        fitnessGoal,
        activityLevel,
        sportsInterests,
        firstName,
        lastName,
        aboutMe,
        address,
        location,
        roles,
        isCoach,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;
