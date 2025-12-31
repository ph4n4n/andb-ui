#!/usr/bin/env node

/**
 * Sync Docker Compose DB configuration to Andb storage
 */

const Store = require('electron-store');
const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('🔄 Syncing Docker Compose DB config to Andb...\n');

// Initialize electron-store
const store = new Store({
  name: 'config',
  cwd: path.join(os.homedir(), 'Library', 'Application Support', 'Andb')
});

const connections = [
  {
    id: '1',
    name: 'DEV',
    host: '127.0.0.1',
    port: 3306,
    database: 'dev_database',
    username: 'root',
    password: 'root123',
    status: 'idle',
    environment: 'DEV'
  },
  {
    id: '2',
    name: 'STAGE',
    host: '127.0.0.1',
    port: 3307,
    database: 'stage_database',
    username: 'root',
    password: 'root123',
    status: 'idle',
    environment: 'STAGE'
  },
  {
    id: '3',
    name: 'UAT',
    host: '127.0.0.1',
    port: 3308,
    database: 'uat_database',
    username: 'root',
    password: 'root123',
    status: 'idle',
    environment: 'UAT'
  },
  {
    id: '4',
    name: 'PROD',
    host: '127.0.0.1',
    port: 3309,
    database: 'prod_database',
    username: 'root',
    password: 'root123',
    status: 'idle',
    environment: 'PROD'
  }
];

try {
  store.set('connections', connections);
  console.log('✅ Connections synced successfully from docker-compose.yml');
  console.log('🚀 Re-launch the app to see the updated configurations.');
} catch (error) {
  console.error('❌ Failed to sync config:', error);
  process.exit(1);
}
