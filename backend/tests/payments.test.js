process.env.RESEND_API_KEY = 're_dummy123';
const request = require('supertest');
const app = require('../server');

// Mock mongoose
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(),
  };
});

// Mock JWT to bypass auth middleware during logic tests
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

// Mock Models
jest.mock('../models', () => ({
  User: { findById: jest.fn() },
  Payment: { findById: jest.fn(), find: jest.fn() }
}));

const { User, Payment } = require('../models');

describe('Payments API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/payments/confirm', () => {
    it('should return 403 if user is not PANEL or SUPER_ADMIN', async () => {
      jwt.verify.mockReturnValue({ id: 'user1' });
      User.findById.mockResolvedValue({ _id: 'user1', role: 'MEMBER' }); // Not authorized

      const res = await request(app)
        .post('/api/v1/payments/confirm')
        .set('Authorization', 'Bearer fake_token')
        .send({ paymentId: 'pay123' });
      expect(res.statusCode).toBe(403);
    });

    it('should return 404 if payment does not exist', async () => {
      jwt.verify.mockReturnValue({ id: 'admin1' });
      User.findById.mockResolvedValue({ _id: 'admin1', role: 'SUPER_ADMIN' });
      Payment.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/payments/confirm')
        .set('Authorization', 'Bearer fake_token')
        .send({ paymentId: 'notfound' });
      expect(res.statusCode).toBe(404);
    });
  });
});
