const neo4j = require('neo4j-driver');

let driver;

/**
 * Khởi tạo kết nối Neo4j và kiểm tra tính sẵn sàng
 */
async function initNeo4j() {
  try {
    driver = neo4j.driver(
      process.env.NEO4J_URI || 'bolt://localhost:7687',
      neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || '12345678'
      )
    );

    // Kiểm tra kết nối thực tế tới server
    await driver.verifyConnectivity();
    console.log('✅ Neo4j connected and verified!');
  } catch (error) {
    console.error('❌ Neo4j connection failed:', error.message);
    process.exit(1); // Dừng app nếu không kết nối được DB quan trọng
  }
}

/**
 * Lấy một session mới để truy vấn dữ liệu
 */
function getSession() {
  if (!driver) {
    throw new Error('Driver chưa được khởi tạo. Hãy gọi initNeo4j() trước.');
  }
  return driver.session();
}

/**
 * Đóng kết nối khi tắt app (tránh rò rỉ bộ nhớ)
 */
async function closeNeo4j() {
  if (driver) {
    await driver.close();
    console.log('Neo4j connection closed.');
  }
}

module.exports = { initNeo4j, getSession, closeNeo4j };