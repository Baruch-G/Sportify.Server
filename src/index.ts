import express, { urlencoded, json } from "express";
import connectDB from "./db.js";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from "./swaggerOptions.js";
import eventRouter from "./routes/eventRouter.js";
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

app.listen(port, () => {
  console.log(`Sportify server is listening at port ${port}`);
});