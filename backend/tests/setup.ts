import { pool } from '../src/config/database';

beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  await pool.end();
});

beforeEach(async () => {
  // Clear test data before each test if needed
});
