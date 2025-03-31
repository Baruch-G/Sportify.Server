import express, { urlencoded, json } from "express";
import connectDB from "./db";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from "./swaggerOptions";
import eventRouter from "./routes/eventRouter";
import suggestionRouter from "./routes/suggestionRouter"
import categoryRouter from "./routes/categoryRouter";
import userRouter from "./routes/userRouter"
import 'dotenv/config';
import cors from "cors";
const port = process.env.PORT || 3000;
const app = express();

const allowedOrigins = ["http://localhost:5173", "https://sportify-qa-client.onrender.com", "https://sportify-client-gsxc.onrender.com","http://localhost:3000"];


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(urlencoded({ extended: true }));


const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(json());


// Connect to MongoDB
connectDB();

// Routers
app.use('/events', eventRouter);
app.use('/suggestions', suggestionRouter);
app.use('/categories',categoryRouter)
app.use('/users',userRouter)

app.listen(port, () => {
  console.log(`Sportify server is listening at port ${port}`);
});