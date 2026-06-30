process.env.RESEND_API_KEY = 're_dummy123';
const request = require('supertest');
const app = require('../server');
const bcrypt = require('bcryptjs');

// Mock mongoose to prevent actual DB connection during tests
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(),
  };
});

jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  }
}));

const { User } = require('../models');

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 if credentials are not provided', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.statusCode).toBe(400);
    });

    it('should return 401 for incorrect credentials', async () => {
      User.findOne.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@test.com', password: 'password123' });
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should login successfully and return a JWT token', async () => {
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      User.findOne.mockResolvedValue({
        _id: 'userid123',
        email: 'test@example.com',
        status: 'ACTIVE',
        role: 'MEMBER',
        memberId: 'AGC-123456'
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });
  });
});
