import getPrismaInstance from "../utils/PrismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const addUser = async (req, res, next) => {
    try {
        console.log(req.body);
        const { firstName, lastName, username, email, password } = req.body;
        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        const prisma = getPrismaInstance();

        const user = await prisma.$transaction(async (prisma) => {
            return await prisma.user.create({
                data: req.body,
            });
        });
        const accessToken = jwt.sign({
            UserInfo: {
                id: user.id
            }
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m"
        });
        const refreshToken = jwt.sign({
            UserInfo: {
                id: user.id
            }
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "7d"
        });
        res.cookie("jwt", refreshToken, {
            httpOnly: true, // accessible through http only and not by js
            secure: true, // https
            sameSite: "None",
            maxAge: 1000 * 60 * 60 * 24 * 7 // cross site cookie
        });
        res.status(201).json({
            message: "User created successfully",
            accessToken,
            user,
        })


    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }

};

export const login = async (req, res, next) => {
    try {
        const accessToken = jwt.sign({
            UserInfo: {
                id: req.user.id
            }
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m"
        });
        const refreshToken = jwt.sign({
            UserInfo: {
                id: req.user.id
            }
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "7d"
        });
        res.cookie("jwt", refreshToken, {
            httpOnly: true, // accessible through http only and not by js
            secure: true, // https
            sameSite: "None",
            maxAge: 1000 * 60 * 60 * 24 * 7 // cross site cookie
        });
        res.status(200).json({
            message: "Login successful",
            accessToken,
            user: req.user
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "Invalid credentials"
        })
    }
};



export const checkAuthorization = async (req, res, next) => {
    try {
        let user;

        // Check if the user is authenticated via session
        if (req.session && req.session.user) {
            user = req.session.user;
        }
        
        // If no user is found in session, check for token
        if (!user && req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]; // Authorization: Bearer <token>
            
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user = decoded; // Assuming the decoded token contains user information
        }

        // If no user is found, return a 401 Unauthorized
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check if the user is an admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        // If user is admin, allow the request to proceed
        next();
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
