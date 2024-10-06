import express from "express";
import passport from "passport";
const router = express.Router();
router.get("/google/callback", passport.authenticate("google", {
    successRedirect: "/auth/login/success",
    failureRedirect: "/login/failed", // update the route
}));
router.get("/login/success", (req, res) => {
    if(req.user) {
        res.status(200).json({
            error: false,
            message:  "You have successfully logged in",
            user: req.user
        })
    } else {
        res.status(401).json({
            error: true,
            message: "Log in failure",
        });
    }
});
router.get("/login/failed", (req, res) => {
    res.status(401).json({
        error: true,
        message: "Log in failure",
    });
});
router.get("/google", passport.authenticate("google", ["profile,  email"]));
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("http://localhost:5500")
});
export default router;