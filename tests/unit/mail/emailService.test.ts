jest.resetModules();
jest.unmock('../../../src/mail/emailService');

describe('Email Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.EMAIL_HOST = 'smtp.example.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'sender@example.com';
    process.env.EMAIL_PASS = 'secret-password';
    process.env.EMAIL_ALLOW_INSECURE_TLS = 'false';
    process.env.EMAIL_SECURE = 'false';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('sendConfirmationEmail', () => {
    it('should send email successfully and return message info', async () => {
      // Arrange
      jest.mock('nodemailer', () => ({
        createTransport: () => ({
          sendMail: jest.fn().mockResolvedValue({
            accepted: ['recipient@example.com'],
            messageId: '<test-id@example.com>'
          })
        })
      }));

      const svc = require('../../../src/mail/emailService');

      // Act & Assert
      await expect(
        svc.sendConfirmationEmail('recipient@example.com', 'Test', '<p>Test</p>')
      ).resolves.toBeDefined();
    });

    it('should call sendMail with correct parameters', async () => {
      // Arrange
      const mockSendMail = jest.fn().mockResolvedValue({ accepted: [], messageId: 'test' });
      jest.mock('nodemailer', () => ({
        createTransport: () => ({ sendMail: mockSendMail })
      }));

      const svc = require('../../../src/mail/emailService');

      // Act
      await svc.sendConfirmationEmail('user@test.com', 'Welcome', '<h1>Hello</h1>');

      // Assert
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'sender@example.com',
        to: 'user@test.com',
        subject: 'Welcome',
        html: '<h1>Hello</h1>'
      });
    });

    it('should use secure TLS by default', async () => {
      // Arrange
      let capturedConfig: unknown;
      jest.mock('nodemailer', () => ({
        createTransport: (config: unknown) => {
          capturedConfig = config;
          return {sendMail: jest.fn().mockResolvedValue({}) };
        }
      }));

      const svc = require('../../../src/mail/emailService');

      // Act
      await svc.sendConfirmationEmail('test@test.com', 'Test', '<p>Test</p>');

      // Assert
      const config = capturedConfig as Record<string, unknown>;
      expect((config.tls as Record<string, unknown>).rejectUnauthorized).toBe(true);
    });

    it('should allow insecure TLS when flag is true', async () => {
      // Arrange
      jest.resetModules();
      process.env.EMAIL_ALLOW_INSECURE_TLS = 'true';

      let capturedConfig: unknown;
      jest.mock('nodemailer', () => ({
        createTransport: (config: unknown) => {
          capturedConfig = config;
          return { sendMail: jest.fn().mockResolvedValue({}) };
        }
      }));

      const svc = require('../../../src/mail/emailService');

      // Act
      await svc.sendConfirmationEmail('test@test.com', 'Test', '<p>Test</p>');

      // Assert
      const config = capturedConfig as Record<string, unknown>;
      expect((config.tls as Record<string, unknown>).rejectUnauthorized).toBe(false);
    });

    it('should set secure true for port 465', async () => {
      // Arrange
      jest.resetModules();
      process.env.EMAIL_PORT = '465';

      let capturedConfig: unknown;
      jest.mock('nodemailer', () => ({
        createTransport: (config: unknown) => {
          capturedConfig = config;
          return { sendMail: jest.fn().mockResolvedValue({}) };
        }
      }));

      const svc = require('../../../src/mail/emailService');

      // Act
      await svc.sendConfirmationEmail('test@test.com', 'Test', '<p>Test</p>');

      // Assert
      const config = capturedConfig as Record<string, unknown>;
      expect(config.port).toBe(465);
      expect(config.secure).toBe(true);
    });

    it('should propagate transporter errors', async () => {
      // Arrange
      jest.mock('nodemailer', () => ({
        createTransport: () => ({
          sendMail: jest.fn().mockRejectedValue(new Error('SMTP failed'))
        })
      }));

      const svc = require('../../../src/mail/emailService');

      // Act & Assert
      await expect(
        svc.sendConfirmationEmail('test@test.com', 'Test', '<p>Test</p>')
      ).rejects.toThrow('SMTP failed');
    });

    it('should set secure true when EMAIL_SECURE is explicitly true', async () => {
      // Arrange
      jest.resetModules();
      process.env.EMAIL_SECURE = 'true';

      let capturedConfig: unknown;
      jest.mock('nodemailer', () => ({
        createTransport: (config: unknown) => {
          capturedConfig = config;
          return { sendMail: jest.fn().mockResolvedValue({}) };
        }
      }));

      const svc = require('../../../src/mail/emailService');

      // Act
      await svc.sendConfirmationEmail('test@test.com', 'Test', '<p>Test</p>');

      // Assert
      const config = capturedConfig as Record<string, unknown>;
      expect(config.secure).toBe(true);
    });

    it('should use default port 587 when EMAIL_PORT is not set', async () => {
      // Arrange
      jest.resetModules();
      delete process.env.EMAIL_PORT;

      let capturedConfig: unknown;
      jest.mock('nodemailer', () => ({
        createTransport: (config: unknown) => {
          capturedConfig = config;
          return { sendMail: jest.fn().mockResolvedValue({}) };
        }
      }));

      const svc = require('../../../src/mail/emailService');

      // Act
      await svc.sendConfirmationEmail('test@test.com', 'Test', '<p>Test</p>');

      // Assert
      const config = capturedConfig as Record<string, unknown>;
      expect(config.port).toBe(587);
    });

    it('should handle authentication errors', async () => {
      // Arrange
      jest.mock('nodemailer', () => ({
        createTransport: () => ({
          sendMail: jest.fn().mockRejectedValue(
            new Error('Invalid login: 535 Authentication failed')
          )
        })
      }));

      const svc = require('../../../src/mail/emailService');

      // Act & Assert
      await expect(
        svc.sendConfirmationEmail('test@test.com', 'Test', '<p>Test</p>')
      ).rejects.toThrow('Invalid login');
    });

    it('should send email with HTML content', async () => {
      // Arrange
      const mockSendMail = jest.fn().mockResolvedValue({
        accepted: ['user@example.com'],
        messageId: '<test@example.com>'
      });

      jest.mock('nodemailer', () => ({
        createTransport: () => ({ sendMail: mockSendMail })
      }));

      const svc = require('../../../src/mail/emailService');
      const htmlContent = '<div><h1>News</h1><p>Content here</p></div>';

      // Act
      await svc.sendConfirmationEmail('user@example.com', 'Newsletter', htmlContent);

      // Assert
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ html: htmlContent })
      );
    });

    it('should use EMAIL_USER as from address', async () => {
      // Arrange
      jest.resetModules();
      process.env.EMAIL_USER = 'noreply@company.com';

      const mockSendMail = jest.fn().mockResolvedValue({
        accepted: ['customer@example.com'],
        messageId: '<test@example.com>'
      });

      jest.mock('nodemailer', () => ({
        createTransport: () => ({ sendMail: mockSendMail })
      }));

      const svc = require('../../../src/mail/emailService');

      // Act
      await svc.sendConfirmationEmail('customer@example.com', 'Notification', '<p>Important</p>');

      // Assert
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'noreply@company.com' })
      );
    });
  });
});
