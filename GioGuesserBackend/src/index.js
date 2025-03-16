import express from "express";
import mapillaryRouter from "./router/getimage.router.js";
import cors from 'cors'
const app = express();
app.use(express.json());

app.use(cors("*"))
// Use the router
app.use("/api", mapillaryRouter);



const PORT = 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
