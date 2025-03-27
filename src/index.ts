import express, { urlencoded, json } from "express";
import connectDB from "./db";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from "./swaggerOptions";
import eventRouter from "./routes/eventRouter";
import categoryRouter from "./routes/categoryRouter";
import userRouter from "./routes/userRouter"
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
app.use('/categories',categoryRouter)
app.use('/users',userRouter)

app.listen(port, () => {
  console.log(`Sportify server is listening at port ${port}`);
});