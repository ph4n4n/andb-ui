const { app } = require('electron');

app.whenReady().then(() => {
  try {
    console.log('--- START SQLITE STORAGE TEST ---');

    console.log('Testing SQLiteStorageService...');
    const { SQLiteStorageService } = require('../dist-electron/electron/services/sqlite-storage');

    console.log('Getting instance...');
    const storage = SQLiteStorageService.getInstance();
    console.log('✓ Instance created');

    // Test save DDL
    console.log('\nTesting saveDDL...');
    const testDDL = {
      environment: 'DEV',
      database: 'test_db',
      type: 'TABLES',
      name: 'users',
      content: 'CREATE TABLE users (id INT PRIMARY KEY);'
    };

    storage.saveDDL(testDDL);
    console.log('✓ DDL saved');

    // Test get DDL
    console.log('\nTesting getDDL...');
    const retrieved = storage.getDDL('DEV', 'test_db', 'TABLES', 'users');
    console.log('Retrieved:', retrieved);
    console.log('✓ DDL retrieved');

    // Test get DDL list
    console.log('\nTesting getDDLList...');
    const list = storage.getDDLList('DEV', 'test_db', 'TABLES');
    console.log('List:', list);
    console.log('✓ DDL list retrieved');

    // Test save comparison
    console.log('\nTesting saveComparison...');
    storage.saveComparison({
      srcEnv: 'DEV',
      destEnv: 'PROD',
      database: 'test_db',
      type: 'TABLES',
      name: 'users',
      status: 'new'
    });
    console.log('✓ Comparison saved');

    // Test get comparisons
    console.log('\nTesting getComparisons...');
    const comparisons = storage.getComparisons('DEV', 'PROD', 'test_db');
    console.log('Comparisons:', comparisons);
    console.log('✓ Comparisons retrieved');

    // Test stats
    console.log('\nTesting getStats...');
    const stats = storage.getStats();
    console.log('Stats:', stats);
    console.log('✓ Stats retrieved');

    // Cleanup
    console.log('\nCleaning up...');
    storage.clearAll();
    console.log('✓ Data cleared');

    console.log('\n--- ALL TESTS PASSED ---');
    storage.close();
    app.quit();
  } catch (e) {
    console.error('FATAL:', e);
    app.quit();
  }
});
