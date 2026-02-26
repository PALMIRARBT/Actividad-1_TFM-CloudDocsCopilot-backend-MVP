import {
  validatePassword,
  validatePasswordOrThrow,
  getPasswordRequirementsMessage,
  PASSWORD_REQUIREMENTS
} from '../../../src/utils/password-validator';

describe('password-validator utilities', () => {
  test('validatePassword returns valid for a strong password', () => {
    const pw = 'Str0ng!Passw0rd';
    const res = validatePassword(pw);
    expect(res.isValid).toBe(true);
    expect(res.errors.length).toBe(0);
  });

  test('validatePassword handles missing password', () => {
    const res = validatePassword('');
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain('Password is required');
  });

  test('validatePassword detects short passwords', () => {
    const res = validatePassword('A1!a');
    expect(res.isValid).toBe(false);
    expect(res.errors.some(e => e.includes(`${PASSWORD_REQUIREMENTS.minLength}`))).toBe(true);
  });

  test('validatePassword detects whitespace', () => {
    const res = validatePassword('Abc 123!');
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain('Password must not contain whitespace characters');
  });

  test('validatePasswordOrThrow throws for invalid password', () => {
    expect(() => validatePasswordOrThrow('short')).toThrow(/Password validation failed/);
  });

  test('getPasswordRequirementsMessage includes key lines', () => {
    const msg = getPasswordRequirementsMessage();
    expect(msg).toContain('At least');
    expect(msg).toContain('No whitespace characters');
  });
});
