import getPrismaInstance from "../utils/PrismaClient.js";
import {v2 as cloudinary} from "cloudinary";

export const addArticle = async (req, res, next) => {
    try {
        console.log(req.body);
        const { title, content, authorId } = req.body;

        if (!title || !content || !authorId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        // If images are present in the request
        const imageFiles = req.files; // Multer stores uploaded files in req.files
        let imageLinks = [];

        if (imageFiles && imageFiles.length > 0) {
            // Map each file and upload it to Cloudinary
            const uploadPromises = imageFiles.map(file => 
                cloudinary.uploader.upload(file.path, { resource_type: "image" })
            );

            // Wait for all uploads to finish and get the URLs
            const uploadedImages = await Promise.all(uploadPromises);

            imageLinks = uploadedImages.map(result => result.secure_url);
        }
        const prisma = getPrismaInstance();
            
        await prisma.$transaction(async (prisma) => {
            const article = await prisma.article.create({
                data: {
                    title,
                    content,
                    authorId,
                    images: imageLinks,
                }
            });
            res.status(201).json(article);
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// export const getAllArticles = async (req, res, next) => {
//     try {
//         const prisma = getPrismaInstance();
//         // Get page and limit from query parameters (defaults: page 1, limit 10)
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;

//         // Calculate how many records to skip
//         const skip = (page - 1) * limit;
//         await prisma.$transaction(async (prisma) => {
//             const articles = await prisma.article.findMany({
//                 skip,
//                 take: limit,
//                 orderBy: {createdAt: "desc"}
//             }); // Ask for the correct way of paginating and skipping records.
//             const totalArticles = await prisma.article.count();
//             res.status(200).json({
//                 articles,
//                 currentPage: page,
//                 totalPages: Math.ceil(totalArticles / limit)
//             });
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: "Internal server error" });
//     };
// };

export const getAllArticles = async (req, res, next) => {
    try {
        const prisma = getPrismaInstance();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch articles and total count separately
        const articles = await prisma.article.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        });

        const totalArticles = await prisma.article.count();

        // Send response after retrieving all data
        res.status(200).json({
            articles,
            currentPage: page,
            totalPages: Math.ceil(totalArticles / limit)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};




// export const getAllArticles = async (req, res, next) => {
//     try {
//         let { sort, fields, limit, page, ...rest } = req.query;

//         const prisma = getPrismaInstance();
//         await prisma.$transaction(async (prisma) => {
//             const query = prisma.article.findMany({});
//             page = +this.page || 1;
//             limit = +this.limit || 10;
//             const skip = (page - 1) * limit;
//             query = query.skip(skip).limit(limit);
//             let articles = await query;
//             res.status(201).json(articles);
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: "Internal server error" });
//     };
// };

export const getArticle = async (req, res, next) => {
    try {
        const {id} = req.params;
        const prisma = getPrismaInstance();
        await prisma.$transaction(async (prisma) => {
            const articles = await prisma.article.findUnique({where: {id}});
            res.status(201).json(articles);
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    };
};

export const deleteArticle = async (req, res, next) => {
    try {
        const {id} = req.params;
        const prisma = getPrismaInstance();
        await prisma.$transaction(async (prisma) => {
            const deletedArticle = await prisma.article.delete({
                where: { id }, // Delete the article with the specified id
            });
            res.status(200).json({
                message: "Article deleted successfully",
                article: deletedArticle,
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    };
};