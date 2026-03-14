import { jest } from '@jest/globals';

describe('EmailService (Simple)', () => {
  beforeAll(() => {
    process.env.SENDGRID_API_KEY = 'SG.test-key';
    process.env.EMAIL_USER = 'sender@example.com';
  });

  describe('sendConfirmationEmail', (): void => {
    it('should be a callable async function', async (): Promise<void> => {
      const { sendConfirmationEmail } = require('../../../src/mail/emailService');
      expect(typeof sendConfirmationEmail).toBe('function');
    });

    it('should send email successfully', async (): Promise<void> => {
      const sgMailModule = require('@sendgrid/mail');
      sgMailModule.default.send.mockResolvedValueOnce([{
        statusCode: 202,
        body: {},
        headers: {}
      }]);

      const { sendConfirmationEmail } = require('../../../src/mail/emailService');
      const result = await sendConfirmationEmail('test@example.com', 'Test Subject', '<p>Test HTML</p>');
      
      expect(result).toBeDefined();
      expect(result.statusCode).toBe(202);
    });
  });
});
