const { app } = require('electron');

app.whenReady().then(() => {
  try {
    console.log('--- START TEST ---');

    console.log('Testing require(mysql2)...');
    try {
      const mysql = require('mysql2');
      console.log('mysql2 loaded. Keys:', Object.keys(mysql));
      console.log('createConnection type:', typeof mysql.createConnection);
    } catch (e) {
      console.error('Failed to load mysql2:', e);
    }

    console.log('Testing require(@andb/core)...');
    try {
      const core = require('@andb/core');
      console.log('Core loaded. Keys:', Object.keys(core));

      const { Container } = core;
      console.log('Container type:', typeof Container);

      // Try to instantiate Container
      const config = {
        getDBDestination: () => ({}),
        getSourceEnv: () => 'dev',
        getDestEnv: () => 'prod',
        getDBName: () => 'test_db',
        replaceWithEnv: (s) => s,
        ENVIRONMENTS: {},
        baseDir: '/tmp',
        logName: 'test'
      };

      console.log('Instantiating Container...');
      const container = new Container(config);
      console.log('Container instantiated.');

      console.log('Getting services...');
      const services = container.getServices();
      console.log('Services retrieved:', Object.keys(services));

      console.log('Getting exporter...');
      const exporter = services.exporter('TABLES');
      console.log('Exporter function type:', typeof exporter);

    } catch (e) {
      console.error('Failed to load/use @andb/core:', e);
    }

    console.log('Testing require(andb-logger)...');
    try {
      const Logger = require('andb-logger');
      console.log('Logger type:', typeof Logger);
      console.log('Logger keys:', Object.keys(Logger));
      if (Logger.getInstance) {
        console.log('Logger.getInstance is function');
      } else {
        console.log('Logger.getInstance is MISSING');
        // Try to create instance
        try {
          new Logger({});
          console.log('Logger can be instantiated via new');
        } catch (e) {
          console.log('Logger cannot be instantiated via new:', e.message);
        }
      }
    } catch (e) {
      console.error('Failed to load andb-logger:', e);
    }

    console.log('--- END TEST ---');
    app.quit();
  } catch (e) {
    console.error('FATAL:', e);
    app.quit();
  }
});
