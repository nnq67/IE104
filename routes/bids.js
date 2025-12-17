const express = require('express');
const router = express.Router();
const auctionService = require('../services/auctionService');

router.post('/', async (req, res) => {
try {
const { itemId, userId, price } = req.body;
const bid = await auctionService.placeBid({ itemId, userId, price });
res.json({ ok: true, bid });
} catch (e) {
res.status(400).json({ error: e.message });
}
});

module.exports = router;