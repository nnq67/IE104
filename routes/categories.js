// File: routes/categories.js

const express = require('express');
const router = express.Router();
const { getSession } = require('../neo4j'); // Đảm bảo đường dẫn này đúng

// Định nghĩa route GET /categories
router.get('/', async (req, res) => {
    const session = getSession();
    const query = `
        MATCH (c:Category)
        RETURN c.category_id AS id, c.category_name AS name
    `;
    
    try {
        const result = await session.run(query);
        
        // Format kết quả từ Neo4j Driver sang mảng JSON đơn giản
        const categories = result.records.map(record => ({
            id: record.get('id'),
            name: record.get('name')
        }));
        
        // Trả về danh sách Category
        res.json(categories);

    } catch (error) {
        console.error("Lỗi khi truy vấn Category từ Neo4j:", error);
        res.status(500).json({ 
            message: "Không thể tải danh sách Category", 
            error: error.message 
        });
    } finally {
        session.close();
    }
});

module.exports = router;