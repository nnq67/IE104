const express = require('express');
const router = express.Router();
const { getSession } = require('../neo4j'); 

// GET /api/categories
router.get('/', async (req, res) => {
    const session = getSession();
    // Sắp xếp theo số để C2 nằm trước C10
    const query = `
        MATCH (c:Category)
        RETURN c.categoryId AS id, c.name AS name
        ORDER BY toInteger(replace(c.categoryId, 'C', '')) ASC
    `;
    try {
        const result = await session.run(query);
        const categories = result.records.map(record => ({
            id: record.get('id'),
            name: record.get('name')
        }));
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

module.exports = router;