const express = require('express');
const router = express.Router();
const { getSession } = require('../neo4j');

/**
 * POST /api/items
 * Add new auction item
 */
router.post('/', async (req, res) => {
  const {
    name,
    owner,
    baseBid,
    timeStart,
    timeEnd
  } = req.body;

  if (!name || !owner || !timeStart || !timeEnd) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const session = getSession();

  try {
    await session.run(
      `
      MERGE (o:User { name: $owner })
      CREATE (i:Item {
        id: randomUUID(),
        name: $name,
        baseBid: $baseBid,
        timeStart: datetime($timeStart),
        timeEnd: datetime($timeEnd),
        createdAt: datetime()
      })
      MERGE (o)-[:OWNS]->(i)
      `,
      {
        name,
        owner,
        baseBid,
        timeStart,
        timeEnd
      }
    );

    res.status(201).json({ message: 'Item created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Neo4j error' });
  } finally {
    await session.close();
  }
});

module.exports = router;
