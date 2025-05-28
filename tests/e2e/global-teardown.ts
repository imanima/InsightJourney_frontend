async function globalTeardown() {
  console.log('🧹 Cleaning up E2E test environment...');
  
  // Clean up test data if needed
  // This could include removing test users, sessions, etc.
  
  console.log('✅ E2E test environment cleaned up');
}

export default globalTeardown; 