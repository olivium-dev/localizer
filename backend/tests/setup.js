// Test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = 5002;
process.env.DB_NAME = 'localizer_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = 5432;

// Set Jest timeout
jest.setTimeout(30000);

// Global beforeAll and afterAll (if needed)
// global.beforeAll(() => {
//   // Setup before all tests
// });

// global.afterAll(() => {
//   // Cleanup after all tests
// }); 