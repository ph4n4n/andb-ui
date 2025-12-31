#!/usr/bin/env node

/**
 * Load sample data into Andb for testing
 * Usage: node load-sample-data.js
 */

const Store = require('electron-store');
const path = require('path');

console.log('🔄 Loading sample data for Andb...\n');

// Initialize electron-store
const store = new Store({
  name: 'config',
  cwd: path.join(require('os').homedir(), 'Library', 'Application Support', 'Andb')
});

// Sample compare data - Tables
const mockTables = [
  {
    name: 'users',
    status: 'different',
    type: 'tables',
    ddl: [
      'ALTER TABLE `users` ADD COLUMN `email_verified` TINYINT(1) DEFAULT 0 AFTER `email`;',
      'ALTER TABLE `users` ADD INDEX `idx_email_verified` (`email_verified`);'
    ],
    diff: {
      source: `CREATE TABLE \`users\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`username\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL,
  \`email_verified\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_username\` (\`username\`),
  UNIQUE KEY \`idx_email\` (\`email\`),
  KEY \`idx_email_verified\` (\`email_verified\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      target: `CREATE TABLE \`users\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`username\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_username\` (\`username\`),
  UNIQUE KEY \`idx_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    }
  },
  {
    name: 'products',
    status: 'missing_in_target',
    type: 'tables',
    ddl: [
      `CREATE TABLE \`products\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  \`stock\` INT(11) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    ],
    diff: {
      source: `CREATE TABLE \`products\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  \`stock\` INT(11) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      target: null
    }
  },
  {
    name: 'old_logs',
    status: 'missing_in_source',
    type: 'tables',
    ddl: ['DROP TABLE IF EXISTS `old_logs`;'],
    diff: {
      source: null,
      target: `CREATE TABLE \`old_logs\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`message\` TEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    }
  }
];

// Sample compare data - Procedures
const mockProcedures = [
  {
    name: 'sp_get_user_stats',
    status: 'different',
    type: 'procedures',
    ddl: [
      `DROP PROCEDURE IF EXISTS \`sp_get_user_stats\`;`,
      `CREATE PROCEDURE \`sp_get_user_stats\`(IN user_id INT)
BEGIN
  SELECT 
    COUNT(*) as total_orders,
    SUM(total) as total_spent
  FROM orders
  WHERE user_id = user_id AND status = 'completed';
END;`
    ],
    diff: {
      source: `CREATE PROCEDURE \`sp_get_user_stats\`(IN user_id INT)
BEGIN
  SELECT 
    COUNT(*) as total_orders,
    SUM(total) as total_spent
  FROM orders
  WHERE user_id = user_id AND status = 'completed';
END;`,
      target: `CREATE PROCEDURE \`sp_get_user_stats\`(IN user_id INT)
BEGIN
  SELECT 
    COUNT(*) as total_orders
  FROM orders
  WHERE user_id = user_id;
END;`
    }
  }
];

// Store sample data
try {
  store.set('compare_DEV_STAGE_TABLES_latest', {
    timestamp: new Date().toISOString(),
    srcEnv: 'DEV',
    destEnv: 'STAGE',
    ddlType: 'TABLES',
    results: mockTables
  });

  store.set('compare_DEV_STAGE_PROCEDURES_latest', {
    timestamp: new Date().toISOString(),
    srcEnv: 'DEV',
    destEnv: 'STAGE',
    ddlType: 'PROCEDURES',
    results: mockProcedures
  });

  store.set('compare_DEV_STAGE_FUNCTIONS_latest', {
    timestamp: new Date().toISOString(),
    srcEnv: 'DEV',
    destEnv: 'STAGE',
    ddlType: 'FUNCTIONS',
    results: []
  });

  console.log('✅ Sample data loaded successfully!');
  console.log(`  📊 Tables: ${mockTables.length}`);
  console.log(`  📝 Procedures: ${mockProcedures.length}`);
  console.log(`  ⚙️  Functions: 0`);
  console.log('\n💡 Open Andb and navigate to Compare page to see the data.\n');

} catch (error) {
  console.error('❌ Failed to load sample data:', error);
  process.exit(1);
}

