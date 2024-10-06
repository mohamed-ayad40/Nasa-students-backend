import bcrypt from "bcrypt";
import getPrismaInstance from "../utils/PrismaClient.js";
export default async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const prisma = getPrismaInstance();
        const user = await prisma.user.findUnique({where: {email}});
        if(!user) res.status(400).json({message:  "User not found"});

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect) res.status(400).json({message: "Invalid password"});
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "Incorrect username or password"
        })
    };
}