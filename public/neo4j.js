const neo4j = require('neo4j-driver');

let driver;

function initNeo4j() {
  driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(
      process.env.NEO4J_USER,
      process.env.NEO4J_PASSWORD
    )
  );
  console.log('Neo4j connected');
}

function getSession() {
  return driver.session();
}

module.exports = { initNeo4j, getSession };
