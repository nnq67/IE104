const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSession } = require('../neo4j'); 

const JWT_SECRET = process.env.JWT_SECRET || 'bi_mat_khong_the_tiet_lo';

/**
 * --- ĐĂNG KÝ ---
 * Sửa lỗi: Đảm bảo khớp với thuộc tính Users.csv (userId, username, password, email, role, balance)
 */
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const session = getSession();
    
    // Log để kiểm tra dữ liệu từ frontend gửi lên
    console.log("Dữ liệu Signup nhận được:", { username, email });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Tạo userId theo format U + timestamp (Ví dụ: U1713900000)
        const userId = "U" + Date.now(); 

        const query = `
            MERGE (u:User {email: $email})
            ON CREATE SET 
                u.userId = $userId,
                u.username = $username,
                u.password = $password,
                u.role = 'user',
                u.balance = toFloat(0),
                u.createdAt = datetime()
            RETURN u
        `;

        const result = await session.run(query, { 
            userId, 
            username, 
            email, 
            password: hashedPassword 
        });

        // Kiểm tra xem có bản ghi nào được trả về không
        if (result.records.length === 0) {
            throw new Error("Không thể tạo User trong Database.");
        }

        const newUser = result.records[0].get('u').properties;
        console.log("✅ Đã lưu User mới thành công:", newUser.userId);

        res.status(201).json({ 
            message: "Đăng ký thành công!", 
            userId: newUser.userId 
        });

    } catch (error) {
        console.error("❌ Lỗi cụ thể tại Auth Signup:", error.message);
        
        if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
            return res.status(400).json({ error: "Email hoặc Username đã tồn tại!" });
        }
        
        res.status(500).json({ error: "Lỗi hệ thống: " + error.message });
    } finally {
        await session.close();
    }
});

/**
 * --- ĐĂNG NHẬP ---
 * Khớp với mật khẩu đã Hash trong Users.csv
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const session = getSession();

    try {
        const result = await session.run(
            'MATCH (u:User {email: $email}) RETURN u',
            { email }
        );

        if (result.records.length === 0) {
            return res.status(401).json({ error: "Email không tồn tại!" });
        }

        const user = result.records[0].get('u').properties;
        let isMatch = false;

        // KIỂM TRA 1: Nếu mật khẩu trong DB có dạng hash (bắt đầu bằng $2b$ hoặc $2a$)
        if (user.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, user.password);
        } 
        
        // KIỂM TRA 2: Nếu chưa khớp (hoặc không phải dạng hash), so sánh trực tiếp
        if (!isMatch) {
            if (password === user.password) {
                isMatch = true;
            }
        }

        if (!isMatch) {
            return res.status(401).json({ error: "Mật khẩu không chính xác!" });
        }

        // Tạo Token
        const token = jwt.sign(
            { userId: user.userId, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            message: "Đăng nhập thành công!", 
            token,
            user: { 
                userId: user.userId,
                username: user.username, 
                balance: user.balance,
                role: user.role
            } 
        });

    } catch (error) {
        console.error("Lỗi Login:", error);
        res.status(500).json({ error: "Lỗi server" });
    } finally {
        await session.close();
    }
});

// Lấy tất cả người dùng từ Neo4j
router.get('/all', async (req, res) => {
    const session = getSession();
    try {
        const result = await session.run(`
            MATCH (u:User) 
            RETURN u.userId AS userId, u.username AS username, u.email AS email, u.role AS role
        `);
        const users = result.records.map(r => ({
            userId: r.get('userId'),
            username: r.get('username'),
            email: r.get('email'),
            role: r.get('role') || 'User'
        }));
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

// Thêm route xóa user nếu cần
router.delete('/users/:id', async (req, res) => {
    const session = getSession();
    try {
        await session.run('MATCH (u:User {userId: $id}) DETACH DELETE u', { id: req.params.id });
        res.json({ message: "Xóa thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

module.exports = router;