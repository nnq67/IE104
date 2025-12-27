const { redis } = require("../redis");
const { v4: uuidv4 } = require("uuid");
const { getSession } = require("../neo4j");
const neo4j = require("neo4j-driver");

let io;

function init(_io) {
  io = _io;
}

async function createAuction(item) {
  const key = `auction:${item.id}`;

  await redis.hset(key, {
    itemId: item.id,
    currentPrice: item.startPrice,
    leader: "",
    endTime: new Date(item.endTime).getTime(),
  });

  const ttlSeconds = Math.floor(
    (new Date(item.endTime).getTime() - Date.now()) / 1000
  );

  if (ttlSeconds > 0) {
    await redis.set(`auction_end:${item.id}`, "1", "EX", ttlSeconds);
  }

  return item;
}

async function placeBid({ itemId, userId, price }) {
  const key = `auction:${itemId}`;
  const data = await redis.hgetall(key);

  if (!data || !data.endTime) throw new Error("Auction not found");

  const endTime = Number(data.endTime);
  if (Date.now() > endTime) throw new Error("Auction already ended");

  const currentPrice = Number(data.currentPrice || 0);
  if (price <= currentPrice) throw new Error("Bid must be higher");

  await redis.hset(key, {
    currentPrice: price,
    leader: userId,
  });

  const bidRecord = {
    id: uuidv4(),
    itemId,
    userId,
    price,
    time: Date.now(),
  };

  await redis.publish(`auction_updates:${itemId}`, JSON.stringify(bidRecord));

  persistBidToNeo4j(bidRecord).catch(console.error);

  return bidRecord;
}

async function persistBidToNeo4j(bid) {
  const session = getSession();
  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})
      MATCH (i:Item {id: $itemId})
      CREATE (b:Bid {id: $id, price: $price, time: $time})
      CREATE (u)-[:BID]->(b)
      CREATE (b)-[:FOR_ITEM]->(i)
      `,
      {
        userId: bid.userId,
        itemId: bid.itemId,
        id: bid.id,
        price: neo4j.int(bid.price),
        time: neo4j.int(bid.time),
      }
    );
  } finally {
    await session.close();
  }
}

module.exports = {
  init,
  createAuction,
  placeBid,
};
