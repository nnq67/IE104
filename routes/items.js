const express = require('express');
const router = express.Router();
const { getSession } = require('../neo4j');

// --- HÀM HELPER ---
const toNum = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'object' && val.toNumber) return val.toNumber();
    if (typeof val === 'string') return parseFloat(val.replace(/\./g, ''));
    return parseFloat(val);
};

const toDateStr = (neoDate) => {
    if (!neoDate) return null;
    if (typeof neoDate === 'string') return neoDate;
    try {
        const d = new Date(
            toNum(neoDate.year),
            toNum(neoDate.month) - 1,
            toNum(neoDate.day),
            neoDate.hour ? toNum(neoDate.hour) : 0,
            neoDate.minute ? toNum(neoDate.minute) : 0
        );
        return d.toISOString();
    } catch (e) { return null; }
};

/**
 * 1. GET ALL ITEMS (Lấy danh sách cho database.html và home.html)
 */
router.get('/', async (req, res) => {
    const session = getSession();
    try {
        const query = `
            MATCH (i:Item)
            OPTIONAL MATCH (u:User)-[b:BIDS]->(i)
            WITH i, b ORDER BY b.price DESC
            WITH i, collect(b.price)[0] AS maxBid
            RETURN 
                i.itemId AS id, i.title AS title, i.author AS author,
                i.startPrice AS startPrice, i.startTime AS startTime,
                i.endTime AS endTime, i.imageUrl AS imageUrl, 
                i.type AS type, maxBid
            ORDER BY id ASC
        `;
        const result = await session.run(query);
        const items = result.records.map(record => {
            const sPrice = toNum(record.get('startPrice'));
            const mBid = toNum(record.get('maxBid'));
            return {
                id: record.get('id'),
                title: record.get('title'),
                author: record.get('author'),
                price: mBid > 0 ? mBid : sPrice,
                startTime: toDateStr(record.get('startTime')),
                endTime: toDateStr(record.get('endTime')),
                imageUrl: record.get('imageUrl'),
                type: record.get('type') || 'current'
            };
        });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { await session.close(); }
});

/**
 * 2. POST NEW ITEM (Lưu sản phẩm mới - ĐÃ SỬA LỖI)
 */
router.post('/', async (req, res) => {
    const session = getSession();
    const { 
        description, sellerId, startPrice, startTime, 
        endTime, imageUrl, descriptionDetail, categoryId 
    } = req.body;

    // Tự động tạo ID và tính toán Type
    const itemId = "I_" + Date.now();
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    let itemType = "current";
    if (now < start) itemType = "coming up";
    else if (now > end) itemType = "expired";

    try {
        const query = `
            MATCH (c:Category {categoryId: $categoryId})
            CREATE (i:Item {
                itemId: $itemId,
                title: $description,
                author: $sellerId,
                startPrice: toFloat($startPrice),
                price: toFloat($startPrice),
                startTime: $startTime, 
                endTime: $endTime,
                imageUrl: $imageUrl,
                description: $descriptionDetail,
                type: $itemType
            })
            CREATE (i)-[:BELONGS_TO]->(c)
            RETURN i.itemId AS id, i.type AS type
        `;

        const result = await session.run(query, {
            itemId, description, sellerId, startPrice, 
            startTime, endTime, imageUrl, descriptionDetail, 
            categoryId, itemType
        });

        if (result.records.length > 0) {
            res.status(201).json({ 
                message: "Thành công!", 
                id: itemId, 
                type: itemType 
            });
        } else {
            res.status(400).json({ error: "Không tìm thấy CategoryID: " + categoryId });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

/**
 * 3. DELETE ITEM (Thêm để nút Delete ở database.js hoạt động)
 */
router.delete('/:id', async (req, res) => {
    const session = getSession();
    try {
        await session.run('MATCH (i:Item {itemId: $id}) DETACH DELETE i', { id: req.params.id });
        res.json({ message: "Xóa thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

/**
 * 4. GET SINGLE ITEM DETAIL
 */
router.get('/:id', async (req, res) => {
    const session = getSession();
    const idFromParam = req.params.id;

    if (!idFromParam || idFromParam === "null") {
        return res.status(400).json({ error: "ID không hợp lệ" });
    }

    try {
        const query = `
            MATCH (i:Item {itemId: $id})
            OPTIONAL MATCH (u:User)-[b:BIDS]->(i)
            WITH i, b ORDER BY b.price DESC
            WITH i, collect(b.price)[0] AS maxBid
            RETURN 
                i.itemId AS id, i.title AS title, i.author AS author,
                i.description AS description, i.startPrice AS startPrice, 
                i.startTime AS startTime, i.endTime AS endTime, i.imageUrl AS imageUrl,
                i.type AS type, maxBid
        `;
        const result = await session.run(query, { id: idFromParam });
        
        if (result.records.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
        }

        const record = result.records[0];
        const mBid = toNum(record.get('maxBid'));
        const sPrice = toNum(record.get('startPrice'));

        res.json({
            id: record.get('id'),
            title: record.get('title'),
            author: record.get('author'),
            description: record.get('description') || "Không có mô tả",
            price: mBid > 0 ? mBid : sPrice,
            startTime: toDateStr(record.get('startTime')),
            endTime: toDateStr(record.get('endTime')),
            imageUrl: record.get('imageUrl'),
            type: record.get('type') || 'current'
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { await session.close(); }
});

// ... Giữ nguyên router.post('/bid') của bạn ...
router.post('/bid', async (req, res) => {
    const session = getSession();
    try {
        const { userId, itemId, bidAmount } = req.body;
        const query = `
            MATCH (i:Item {itemId: $itemId})
            OPTIONAL MATCH (:User)-[b:BIDS]->(i)
            WITH i, max(b.price) AS maxBid
            WITH i, coalesce(maxBid, toFloat(i.startPrice), 0.0) AS currentPrice
            WHERE $bidAmount > currentPrice
            MATCH (u:User {userId: $userId})
            CREATE (u)-[:BIDS {price: $bidAmount, time: datetime()}]->(i)
            RETURN i.itemId AS id
        `;
        const result = await session.run(query, { userId, itemId, bidAmount: parseFloat(bidAmount) });
        if (result.records.length > 0) res.json({ message: "Bid successful" });
        else res.status(400).json({ error: "Giá thầu thấp!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { await session.close(); }
});

module.exports = router;