import express, { urlencoded, json } from "express";
import connectDB from "./db";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from "./swaggerOptions";
import eventRouter from "./routes/eventRouter";
import suggestionRouter from "./routes/suggestionRouter"
import categoryRouter from "./routes/categoryRouter";
import userRouter from "./routes/userRouter"
import coachReviewRouter from "./routes/coachReviewRouter";
import 'dotenv/config';
import cors from "cors";
import path from "path";
const port = process.env.PORT || 3000;
const app = express();

// Get the project root directory (where package.json is located)
const PROJECT_ROOT = path.resolve(__dirname, '..');
console.log('Project root:', PROJECT_ROOT);

const allowedOrigins = ["http://localhost:5173", "http://localhost:4173", "https://sportify-qa-client.onrender.com", "https://sportify-client-gsxc.onrender.com","http://localhost:3000"];


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);
app.use(urlencoded({ extended: true }));

// Increase JSON body parser limit to 50MB to handle base64 images
app.use(json({ limit: '50mb' }));

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(PROJECT_ROOT, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Connect to MongoDB
connectDB();

// Routers
app.use('/events', eventRouter);
app.use('/suggestions', suggestionRouter);
app.use('/categories',categoryRouter)
app.use('/users',userRouter)
app.use('/coach-reviews', coachReviewRouter);

app.listen(port, () => {
  console.log(`Sportify server is listening at port ${port}`);
});