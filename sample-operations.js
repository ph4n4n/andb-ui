// Sample script to populate operations data for testing
// Run this in browser console after app loads

const operationsStore = window.__PINIA__.state.value.operations

// Add some sample operations
const sampleOperations = [
  {
    type: 'compare',
    sourceEnv: 'DEV',
    targetEnv: 'STAGE',
    status: 'success',
    startTime: new Date(Date.now() - 3600000), // 1 hour ago
    endTime: new Date(Date.now() - 3540000),
    ddlCount: 15,
    tableCount: 25
  },
  {
    type: 'migrate',
    sourceEnv: 'DEV',
    targetEnv: 'STAGE',
    connectionId: '1',
    status: 'success',
    startTime: new Date(Date.now() - 7200000), // 2 hours ago
    endTime: new Date(Date.now() - 7020000),
    ddlCount: 8,
    tableCount: 12
  },
  {
    type: 'migrate',
    sourceEnv: 'STAGE',
    targetEnv: 'UAT',
    connectionId: '2',
    status: 'success',
    startTime: new Date(Date.now() - 10800000), // 3 hours ago
    endTime: new Date(Date.now() - 10500000),
    ddlCount: 12,
    tableCount: 18
  },
  {
    type: 'export',
    sourceEnv: 'DEV',
    connectionId: '1',
    status: 'success',
    startTime: new Date(Date.now() - 14400000), // 4 hours ago
    endTime: new Date(Date.now() - 14340000),
    ddlCount: 5,
    tableCount: 8
  },
  {
    type: 'compare',
    sourceEnv: 'UAT',
    targetEnv: 'PROD',
    status: 'failed',
    startTime: new Date(Date.now() - 18000000), // 5 hours ago
    endTime: new Date(Date.now() - 17940000),
    errorMessage: 'Connection timeout'
  }
]

sampleOperations.forEach(op => {
  operationsStore.addOperation(op)
})

console.log('Sample operations added!')
