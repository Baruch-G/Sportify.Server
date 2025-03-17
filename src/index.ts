import express, { urlencoded, json } from "express";
import connectDB from "./db.js";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from "./swaggerOptions.js";
import eventRouter from "./routes/eventRouter.js";
import categoryRouter from "./routes/categoryRouter.js";
import userRouter from "./routes/userRouter.js"
import 'dotenv/config';

const port = process.env.PORT || 3000;
const app = express();

app.use(urlencoded({ extended: true }));


const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(json());


// Connect to MongoDB
connectDB();

// Routers
app.use('/events', eventRouter);
app.use('/category',categoryRouter)
app.use('/users',userRouter)

app.listen(port, () => {
  console.log(`Sportify server is listening at port ${port}`);
});