import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { IUser, UserModel } from "../models/User";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { EventModel } from "../models/Event";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { saveImage, deleteImage } from "../utils/fileUpload";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { UPLOAD_DIR } from "../utils/fileUpload";

const router = express.Router();

// Add Role type at the top of the file after imports
type Role = 'user' | 'coach' | 'admin';

const isRole = (value: string): value is Role => {
  return ['user', 'coach', 'admin'].includes(value);
};

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

// Helper function to generate tokens
const generateTokens = (user: IUser) => {
  const jwtSecret = process.env.JWT_SECRET || "fallback_secret_key";
  const jwtRefreshSecret =
    process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_key";
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
  const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

  const signOptions: SignOptions = {
    expiresIn: jwtExpiresIn as jwt.SignOptions["expiresIn"],
  };
  const refreshSignOptions: SignOptions = {
    expiresIn: jwtRefreshExpiresIn as jwt.SignOptions["expiresIn"],
  };

  const accessToken = jwt.sign(
    { id: user._id, roles: user.roles },
    jwtSecret,
    signOptions
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    jwtRefreshSecret,
    refreshSignOptions
  );

  return { accessToken, refreshToken };
};

// Define a type for async request handlers that properly handles void returns
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Register endpoint
const registerHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, address, location, sportsInterests, coachProfile, isCoach } =
      req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !location
    ) {
      res.status(400).json({
        error: "Missing required fields",
        required: [
          "firstName",
          "lastName",
          "email",
          "password",
          "phone",
          "address",
          "location",
        ],
        received: req.body,
      });
      return;
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    // Create new user
    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      location,
      sportsInterests,
      isCoach,
      coachProfile,
      roles:  isCoach ? ["user", "coach"] : ["user"], // Default role
    });

    await newUser.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser);

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        roles: newUser.roles,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

router.put("/update", async (req: any, res: any) => {
  try {
    const {
      email,
      birthDay,
      gender,
      wheight,
      height,
      fitnessGoal,
      activityLevel,
    } = req.body;
    const updatedUser = await UserModel.findOneAndUpdate(
      { email },
      {
        birthDay,
        gender,
        wheight,
        height,
        fitnessGoal,
        activityLevel,
      },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res
      .status(200)
      .json({ message: "Utilisateur mis à jour avec succès", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
});

router.put("/updateFavoritesSports", async (req: any, res: any) => {
  try {
    const { email, favoriteCategoryIds } = req.body;
    const updatedUser = await UserModel.findOneAndUpdate(
      { email },
      {
        sportsInterests : favoriteCategoryIds,
      },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res
      .status(200)
      .json({ message: "Utilisateur mis à jour avec succès", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
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
// Login endpoint
const loginHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: "Email and password are required",
      });
      return;
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
        roles: user.roles,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

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
    const { role } = req.query;
    let query = {};
    
    if (role === 'user') {
      query = { roles: { $in: ['user'] } };
    } else if (role === 'coach') {
      query = { roles: { $in: ['coach'] } };
    }

    const users = await UserModel.find(query)
      .populate("sportsInterests")
      .populate("coachProfile.specializations");
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
    const user = await UserModel.findById(req.params.id).select(
      "-password"
    ).populate("coachProfile.specializations").populate("sportsInterests");
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

// Refresh token endpoint
const refreshTokenHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    const jwtRefreshSecret =
      process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_key";
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as {
      id: string;
    };
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Refresh token expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }
    next(error);
  }
};

// Get current user profile
const getProfileHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user?._id).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    next(error);
  }
};

// Update user profile (protected route)
const updateProfileHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const allowedUpdates = [
      "firstName",
      "lastName",
      "phone",
      "address",
      "location",
      "birthDay",
      "gender",
      "wheight",
      "height",
      "fitnessGoal",
      "activityLevel",
      "sportsInterests",
      "aboutMe",
    ];

    const updates = Object.keys(req.body)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {} as any);

    const user = await UserModel.findByIdAndUpdate(
      req.user?._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error: any) {
    if (error.name === "ValidationError") {
      res.status(400).json({
        error: "Validation Error",
        details: Object.values(error.errors).map((err: any) => err.message),
      });
      return;
    }
    next(error);
  }
};

// Admin only routes
const getAllUsersHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const users = await UserModel.find().select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserByIdHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const events = await EventModel.find({
      organizer: req.params.id,
    }).populate("category");

    res.json({
      ...user.toObject(),
      events: events.map((event) => event.toObject()),
    });
  } catch (error) {
    next(error);
  }
};

// Multer setup for binary file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'; // Default to .jpg if no extension
    const userId = req.params.userId;
    cb(null, `${userId}${ext}`);
  },
});
const upload = multer({ storage });

// New route: POST /users/upload-profile-image/:userId (binary, no auth)
router.post(
  "/upload-profile-image/:userId",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (!req.file) {
        res.status(400).json({ error: "No image file uploaded" });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        // Clean up uploaded file if user not found
        await fs.promises.unlink(req.file.path);
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Delete old image if it exists and has a different name
      if (user.image) {
        const oldImagePath = path.join(UPLOAD_DIR, path.basename(user.image));
        if (oldImagePath !== req.file.path) { // Only delete if it's a different file
          try {
            await deleteImage(user.image);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }
      }

      // Save new image path (relative URL)
      const relPath = `/uploads/profile-images/${path.basename(req.file.path)}`;
      user.image = relPath;
      await user.save();
      res.json({ message: "Profile image uploaded successfully", imageUrl: relPath });
    } catch (error) {
      console.error("Error in binary upload-profile-image:", error);
      // Clean up uploaded file if there's an error
      if (req.file) {
        try {
          await fs.promises.unlink(req.file.path);
        } catch (unlinkError) {
          console.error("Error cleaning up file after upload error:", unlinkError);
        }
      }
      res.status(500).json({ error: "Failed to upload image" });
    }
  }
);

/**
 * @swagger
 * /users/update-profile-image/{userId}:
 *   patch:
 *     summary: Update user's profile image URL
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the profile image
 *     responses:
 *       200:
 *         description: Profile image updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */
router.patch(
  "/update-profile-image/:userId",
  async (req: any, res: any, next: any) => {
    try {
      const { userId } = req.params;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Delete old image if it exists
      if (user.image) {
        try {
          await deleteImage(user.image);
        } catch (error) {
          console.error("Error deleting old image:", error);
          // Continue with update even if delete fails
        }
      }

      // Update user with new image URL
      user.image = imageUrl;
      await user.save();

      res.json({
        message: "Profile image updated successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          image: user.image,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /users/become-coach:
 *   post:
 *     summary: Update user profile to become a coach
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - aboutMe
 *               - coachingStyle
 *               - hourlyRate
 *               - languages
 *               - specializations
 *               - certifications
 *               - achievements
 *               - coachingStartDate
 *             properties:
 *               aboutMe:
 *                 type: string
 *               coachingStyle:
 *                 type: string
 *               hourlyRate:
 *                 type: number
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: object
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               achievements:
 *                 type: array
 *                 items:
 *                   type: string
 *               coachingStartDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: User successfully updated to coach
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
const becomeCoachHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const {
      aboutMe,
      coachingStyle,
      hourlyRate,
      languages,
      specializations,
      certifications,
      achievements,
      coachingStartDate
    } = req.body;

    // Validate required fields
    if (!aboutMe || !coachingStyle || !hourlyRate || !languages || !specializations || !certifications || !achievements || !coachingStartDate) {
      res.status(400).json({
        error: "Missing required fields",
        required: [
          "aboutMe",
          "coachingStyle",
          "hourlyRate",
          "languages",
          "specializations",
          "certifications",
          "achievements",
          "coachingStartDate"
        ]
      });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Update user to become a coach
    user.isCoach = true;
    // Ensure all roles are valid Role types
    const currentRoles = user.roles.filter(isRole);
    user.roles = [...new Set([...currentRoles, 'coach'])] as Role[];
    user.coachProfile = {
      aboutMe,
      coachingStyle,
      hourlyRate,
      languages,
      specializations,
      certifications,
      achievements,
      coachingStartDate: new Date(coachingStartDate)
    };

    await user.save();

    res.status(200).json({
      message: "Successfully updated to coach profile",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isCoach: user.isCoach,
        roles: user.roles,
        coachProfile: user.coachProfile
      }
    });
    return;
  } catch (error: any) {
    console.error("Error in become-coach:", error);
    if (error.name === "ValidationError") {
      res.status(400).json({
        error: "Validation Error",
        details: Object.values(error.errors).map((err: any) => err.message)
      });
      return;
    }
    next(error);
  }
};

// Register routes with proper middleware types
router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/refresh-token", refreshTokenHandler);
router.get("/me", authenticateToken, getProfileHandler);
router.put("/me", authenticateToken, updateProfileHandler);
router.get("/", authenticateToken, authorizeRoles("admin"), getAllUsersHandler);
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  getUserByIdHandler
);
router.post("/become-coach", authenticateToken, becomeCoachHandler);

export default router;
