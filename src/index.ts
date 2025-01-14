import express, { urlencoded, json } from "express";
import exampleRouter from "./routes/event_route.js"
import 'dotenv/config';

const port = process.env.PORT || 3000;
const app = express();

app.use(urlencoded({ extended: true }));
app.use(json());

app.use('/events', exampleRouter);

app.listen(port, () => {
  console.log(`Sportify server is listening at port ${port}`);
});