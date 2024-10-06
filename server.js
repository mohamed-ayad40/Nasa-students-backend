import "dotenv/config.js";
import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import articlesRouter from "./routes/articleRoute.js";
import usersRouter from "./routes/userRoute.js";
import authRouter from "./routes/authRoute.js";
process.on("uncaughtException", (err) => {
    console.log(err.name, err.message);
    console.log("Uncaught exception occurred! Shutting down...");
        process.exit(1);
});
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
    session({
        secret: "nasa+space+teams",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }  // secure: true if using HTTPS
    })
)
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    methods: "GET,POST,PUT,PATCH,DELETE",
    credentials: true,
}))

app.use("/auth", authRouter);
app.use("/api/articles",  articlesRouter);
app.use("/api/users",  usersRouter);
app.all("*", (req, res, next) => {
    res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on the server`
    });
    // const err = new CustomError(`Can't find ${req.originalUrl} on the server`, 404);
    // next(err);
});



const port = process.env.PORT || 3000;

let server = app.listen(port, () => {
    console.log("Connected to server!");
});

process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.log("Unhandled rejection occurred! Shutting down...");
    server.close(() => {
        process.exit(1);
    });
});