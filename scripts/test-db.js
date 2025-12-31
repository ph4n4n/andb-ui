#!/usr/bin/env node

/**
 * Test database initialization
 */

const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

const userDataPath = path.join(os.homedir(), 'Library', 'Application Support', 'Andb');
const dbPath = path.join(userDataPath, 'history.db');

console.log('Testing database initialization...');
console.log('DB Path:', dbPath);

try {
  const db = new Database(dbPath);
  console.log('✅ Database created successfully!');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS test (
      id INTEGER PRIMARY KEY,
      name TEXT
    )
  `);
  
  db.prepare('INSERT INTO test (name) VALUES (?)').run('test-data');
  const result = db.prepare('SELECT * FROM test').all();
  
  console.log('✅ Test table created and data inserted:', result);
  
  db.close();
  console.log('✅ Database closed');
  
} catch (error) {
  console.error('❌ Error:', error);
}

