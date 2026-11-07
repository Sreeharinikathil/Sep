const fs = require('fs');
const path = require('path');
const db = require('./database');

function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schemaSql);
  console.log('✅ Database schema initialized successfully.');
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
