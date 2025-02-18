const express = require("express");
const User = require("../models/user");
const bcrypt = require('bcrypt');
const { validateSignupData } = require("../utils/validator");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const { userAuth } = require("../middlewares/auth");
const nodemailer = require('nodemailer');

authRouter.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, emailId, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 3);
        const user = new User({
            firstName: firstName,
            lastName: lastName,
            emailId: emailId,
            password: passwordHash
        });
        await user.save();
        res.send("user " + user.firstName + " added successfully")
    }
    catch (error) {
        res.status(400).send(error?.errorResponse?.errmsg);
    }
});

authRouter.post("/login", async (req, res) => {
    if (req.body.emailId && req.body.password) {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            return res.status(404).json({
                message: "Email is not present in DB",
                data: req.body
            });
        }
        let isPasswordValid;
        if (password && user?.password) {
            isPasswordValid = await bcrypt.compare(password, user?.password);
        }
        if (!isPasswordValid) {
            return res.status(404).json({
                message: "Invalid credentials",
                data: req.body
            });
        }
        else {
            const token = await jwt.sign({ _id: user.id }, "secretkey");
            res.cookie("token", token);
            return res.json({
                message: "Logged in successfully",
                data: user
            })
        }
    }
    else {
        return res.status(404).json({
            message: "Invalid payload",
            data: req.body
        });
    }

});

authRouter.post("/logout", async (req, res) => {
    const { emailId } = req.body;
    const user = await User.findOne({ emailId: emailId });
    res.cookie("token", null);
    res.json({
        message: "Logged out successfully",
        data: user
    })
}
);

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like 'yahoo', 'hotmail', etc.
    auth: {
        user: "prafulkusugal@gmail.com", // Your email address
        pass: "pakm rqea xxdr yffd"
    }
});

// Endpoint to send email
authRouter.post('/sendEmail', async (req, res) => {
    const { to,otp} = req.body;

    const mailOptions = {
        from: "prafulkusugal@gmail.com", // Sender address
        to: to,                       // List of recipients
        subject: "Reset DevTinder Password",             // Subject line
        text: "Please use this OTP " + otp +" to reset DevTinder Password"                    // Plain text body
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        res.json({ message: 'Email sent successfully', info });
    } catch (error) {
        res.status(500).send({ message: 'Failed to send email', error: error.message });
    }
});

module.exports = authRouter;