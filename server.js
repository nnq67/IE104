require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const cors = require("cors");
const path = require("path");
const session = require("express-session");

const redisClient = require("./redis");
const { initNeo4j } = require("./neo4j");
const auctionService = require("./services/auctionService");

const itemsRouter = require("./routes/items");
const bidsRouter = require("./routes/bids");
const categoriesRouter = require("./routes/categories");
const authRouter = require("./routes/auth");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "uit_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/bids", bidsRouter);
app.use("/api/categories", categoriesRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

auctionService.init(io, redisClient);

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);
  socket.on("joinAuction", (itemId) => socket.join(`auction:${itemId}`));
  socket.on("disconnect", () => console.log("❌ Socket disconnected"));
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initNeo4j();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
