const IORedis = require('ioredis');

const redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const sub = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// subscribe to auction update channels
sub.psubscribe('auction_updates:*', (err, count) => {
if (err) console.error('pSubscribe error', err);
});

module.exports = { redis, sub };