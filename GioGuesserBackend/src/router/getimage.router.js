// routes/mapillaryRouter.js
import { Router } from "express";
import { getFullImageList } from "../controller/getimage.controller.js";

const router = Router();

router.get("/getfullimagelist", getFullImageList);

export default router;
