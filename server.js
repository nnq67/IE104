require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
// const bodyParser = require('body-parser'); // Không cần thiết vì express.json() đã làm thay
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const redisClient = require('./redis');
const { initNeo4j } = require('./neo4j');
const auctionService = require('./services/auctionService');

const itemsRouter = require('./routes/items');
const bidsRouter = require('./routes/bids');
const categoriesRouter = require('./routes/categories');
const authRouter = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// 1. Cấu hình Socket.io
const io = new Server(server, { 
    cors: { origin: '*' } 
});

// 2. Middleware
// SỬA: Cấu hình CORS chi tiết hơn để tránh lỗi khi gọi từ Live Server (Port 5500)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 3. Cấu hình Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'uit_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// 4. Các API Route
// SỬA: Đảm bảo các route này khớp với fetch() ở Frontend
app.use('/api/auth', authRouter);       
app.use('/api/items', itemsRouter);     // fetch('/api/items') sẽ vào đây
app.use('/api/bids', bidsRouter);       
app.use('/api/categories', categoriesRouter); // fetch('/api/categories') sẽ vào đây

// 5. Route giao diện
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// 6. Khởi tạo Dịch vụ Đấu giá
auctionService.init(io, redisClient);

// 7. Xử lý Socket.io
io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);
    socket.on('joinAuction', (itemId) => socket.join(`auction:${itemId}`));
    socket.on('disconnect', () => console.log('❌ Socket disconnected'));
});

// 8. Khởi động
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