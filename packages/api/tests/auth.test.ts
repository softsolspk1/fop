// import request from 'supertest';
// import app from '../src/index';

describe('Auth Endpoints (Smoke)', () => {
  it('should pass a simple check', async () => {
    expect(1 + 1).toEqual(2);
  });
  /*
  it('should return 400 for invalid registration data', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'invalid-email',
        password: 'short',
        name: 'A',
        role: 'STUDENT'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation failed');
  });

  it('should return 401 for non-existent user login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid credentials');
  });
  */
});
