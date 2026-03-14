import { jest } from '@jest/globals';

describe('emailService', (): void => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SENDGRID_API_KEY = 'SG.test-key-123';
    process.env.EMAIL_USER = 'sender@example.com';
  });

  it('succeeds when sgMail.send resolves', async (): Promise<void> => {
    const sgMailModule = require('@sendgrid/mail');
    sgMailModule.default.send.mockResolvedValueOnce([{ 
      statusCode: 202, 
      body: {}, 
      headers: {} 
    }]);

    // Reset modules to pick up fresh imports
    jest.resetModules();
    
    const { sendConfirmationEmail } = require('../../src/mail/emailService');
    const result = await sendConfirmationEmail('a@b.com', 'subj', '<p>hi</p>');
    
    expect(result).toBeDefined();
    expect(result.statusCode).toBe(202);
  });

  it('throws when sgMail.send rejects', async (): Promise<void> => {
    // Reset to get fresh imports
    jest.resetModules();
    
    const sgMailModule = require('@sendgrid/mail');
    sgMailModule.default.send.mockRejectedValueOnce(new Error('fail'));

    const { sendConfirmationEmail } = require('../../src/mail/emailService');
    
    await expect(
      sendConfirmationEmail('a@b.com', 'subj', '<p>hi</p>')
    ).rejects.toThrow('fail');
  });

  it('throws when SENDGRID_API_KEY is not configured', async (): Promise<void> => {
    jest.resetModules();
    delete process.env.SENDGRID_API_KEY;

    const { sendConfirmationEmail } = require('../../src/mail/emailService');
    
    await expect(
      sendConfirmationEmail('a@b.com', 'subj', '<p>hi</p>')
    ).rejects.toThrow('SENDGRID_API_KEY environment variable is not configured');
  });

  it('throws when EMAIL_USER is not configured', async (): Promise<void> => {
    jest.resetModules();
    delete process.env.EMAIL_USER;
    delete process.env.SENDGRID_FROM_EMAIL;

    const { sendConfirmationEmail } = require('../../src/mail/emailService');
    
    await expect(
      sendConfirmationEmail('a@b.com', 'subj', '<p>hi</p>')
    ).rejects.toThrow('EMAIL_USER or SENDGRID_FROM_EMAIL environment variable is required');
  });
});
