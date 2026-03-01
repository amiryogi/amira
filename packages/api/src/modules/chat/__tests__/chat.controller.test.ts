import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { createTestApp, generateTestAccessToken } from '../../../test/helpers.js';
import { createTestUser, createTestAdmin } from '../../../test/factories/user.factory.js';

const app = createTestApp();

describe('Chat Controller — POST /api/v1/chat/upload', () => {
  const getToken = async (role: 'user' | 'admin' = 'user') => {
    const user = role === 'admin' ? await createTestAdmin() : await createTestUser();
    return generateTestAccessToken({
      _id: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    });
  };

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .post('/api/v1/chat/upload')
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('should return 400 when no file is provided', async () => {
    const token = await getToken();

    const res = await supertest(app)
      .post('/api/v1/chat/upload')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no file/i);
  });

  it('should upload successfully and return image data', async () => {
    const token = await getToken();

    // Create a small 1x1 PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );

    const res = await supertest(app)
      .post('/api/v1/chat/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', pngBuffer, 'test.png')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('url');
    expect(res.body.data).toHaveProperty('type', 'image');
    // URL is either a Cloudinary URL or placeholder depending on env config
    expect(typeof res.body.data.url).toBe('string');
    expect(res.body.data.url.length).toBeGreaterThan(0);
  });

  it('should allow admin to upload', async () => {
    const token = await getToken('admin');

    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );

    const res = await supertest(app)
      .post('/api/v1/chat/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', pngBuffer, 'admin-upload.png')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('type', 'image');
    expect(typeof res.body.data.url).toBe('string');
  });

  it('should reject non-image files', async () => {
    const token = await getToken();

    const textBuffer = Buffer.from('this is not an image');

    const res = await supertest(app)
      .post('/api/v1/chat/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', textBuffer, 'notimage.txt');

    // Multer fileFilter rejects non-image mimetypes — typically 400 or 500
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
