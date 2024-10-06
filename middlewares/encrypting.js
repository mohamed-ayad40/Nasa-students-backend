import bcrypt from "bcrypt";
export default async (req, res, next) => {
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body = {
        ...req.body,
        password: hashedPassword
    };
    next();
};
