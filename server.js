require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const redisClient = require('./redis');
const { initNeo4j } = require('./neo4j');
const auctionService = require('./services/auctionService');

const itemsRouter = require('./routes/items');
const bidsRouter = require('./routes/bids');
const categoriesRouter = require('./routes/categories');
const authRouter = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

const { getSession } = require('./neo4j.js'); // Import hàm từ file của bạn

app.get('/api/categories', async (req, res) => {
    const session = getSession();
    try {
        // Truy vấn lấy categoryId và name
        // Dùng toString() để đảm bảo ID không bị lỗi kiểu dữ liệu Integer của Neo4j
        const result = await session.run(
            'MATCH (c:Category) RETURN c.categoryId AS id, c.name AS name'
        );

        const categories = result.records.map(record => ({
            id: record.get('id'),
            name: record.get('name')
        }));

        // Trả về mảng JSON cho phía Frontend
        res.json(categories);
    } catch (error) {
        console.error('Lỗi khi lấy categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // BẮT BUỘC: Đóng session để tránh rò rỉ bộ nhớ (memory leak)
        await session.close();
    }
});

const session = require('express-session');

app.use(session({
    secret: 'uit', // Một chuỗi bất kỳ để mã hóa session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Để true nếu bạn xài HTTPS
}));

app.post('/login', async (req, res) => {
    const { identifier } = req.body;
    
    // Gọi hàm từ database
    const auth = await getRoleFromDB(identifier);
    
    // LƯU Ở ĐÂY: Lưu vào đối tượng session của Node.js
    req.session.auth = auth;
    req.session.username = identifier;

    res.json({ 
        message: "Login successful", 
        auth: auth 
    });
});

// Provide io to auction service
auctionService.init(io, redisClient);

app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/bids', bidsRouter);
app.use('/api/categories', categoriesRouter);

io.on('connection', (socket) => {
console.log('socket connected', socket.id);

socket.on('joinAuction', (itemId) => {
socket.join(`auction:${itemId}`);
});

socket.on('leaveAuction', (itemId) => {
socket.leave(`auction:${itemId}`);
});
});

const PORT = process.env.PORT || 3000;

initNeo4j();

server.listen(PORT, () => {
console.log(`Server listening on http://localhost:${PORT}`);
});