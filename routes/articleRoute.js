import express from "express";
import upload from "../middlewares/multer.js";
import {addArticle, getAllArticles, getArticle, deleteArticle} from "../controllers/articlesController.js";
import { checkAuthorization } from "../controllers/usersController.js";
const router = express.Router();

router.get("/get-all", getAllArticles);
router.get("/get/:id", getArticle);
router.post("/add-article", checkAuthorization, upload.array("images", 5), addArticle);
router.delete("/delete-article/:id", checkAuthorization,  deleteArticle);


export default router;