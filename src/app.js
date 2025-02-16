const express = require("express");
const connectToDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./router/auth");
const userRouter = require("./router/user");
const feedRouter = require("./router/feed");
const cors = require('cors');
const connectionRequestRouter = require("./router/connectionRequest");
const app = express();

app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", feedRouter);
app.use("/", connectionRequestRouter);

connectToDB()
    .then(() => {
        console.log("Connected to DB");
        app.listen(3001, () => {
            console.log("Server is successfully connected");
        })
    })
    .catch(() => {
        console.log("Not Connected to DB");
    })
