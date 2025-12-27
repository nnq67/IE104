const neo4j = require("neo4j-driver");

let driver;

async function initNeo4j() {
  try {
    driver = neo4j.driver(
      process.env.NEO4J_URI || "bolt://localhost:7687",
      neo4j.auth.basic(
        process.env.NEO4J_USER || "neo4j",
        process.env.NEO4J_PASSWORD || "12345678"
      )
    );

    await driver.verifyConnectivity();
    console.log("✅ Neo4j connected and verified!");
  } catch (error) {
    console.error("❌ Neo4j connection failed:", error.message);
    process.exit(1);
  }
}

function getSession() {
  if (!driver) {
    throw new Error("Driver chưa được khởi tạo. Hãy gọi initNeo4j() trước.");
  }
  return driver.session();
}

async function closeNeo4j() {
  if (driver) {
    await driver.close();
    console.log("Neo4j connection closed.");
  }
}

module.exports = { initNeo4j, getSession, closeNeo4j };
