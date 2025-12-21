const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSession } = require('../neo4j'); // Sử dụng hàm getSession có sẵn của bạn

const JWT_SECRET = process.env.JWT_SECRET || 'bi_mat_khong_the_tiet_lo';

// --- ĐĂNG KÝ ---
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const session = getSession();
    try {
        // Hash mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu vào Neo4j
        await session.run(
            'CREATE (u:User {username: $username, email: $email, password: $password, createdAt: datetime()}) RETURN u',
            { username, email, password: hashedPassword }
        );

        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
            return res.status(400).json({ error: "Email đã tồn tại!" });
        }
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

// --- ĐĂNG NHẬP ---
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
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Mật khẩu không chính xác!" });
        }

        // Tạo JWT Token
        const token = jwt.sign(
            { username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ message: "Đăng nhập thành công!", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

module.exports = router;