import { describe, it, expect } from 'vitest';
import { generateVerificationCode } from './authenticateEmailCodeGenerator.js';

describe('authenticateEmailCodeGenerator', () => {
    describe('generateVerificationCode', () => {
        it('should generate a 6-digit code', () => {
            const code = generateVerificationCode();
            expect(code).toHaveLength(6);
        });

        it('should generate a numeric code', () => {
            const code = generateVerificationCode();
            expect(code).toMatch(/^\d{6}$/);
        });

        it('should pad with leading zeros when necessary', () => {
            const codes = Array.from({ length: 100 }, () => generateVerificationCode());

            codes.forEach(code => {
                expect(code).toHaveLength(6);
                expect(parseInt(code, 10)).toBeGreaterThanOrEqual(0);
                expect(parseInt(code, 10)).toBeLessThan(1000000);
            });
        });

        it('should generate different codes on subsequent calls', () => {
            const code1 = generateVerificationCode();
            const code2 = generateVerificationCode();
            const code3 = generateVerificationCode();

            // While technically possible to get duplicates, it's extremely unlikely
            const allSame = code1 === code2 && code2 === code3;
            expect(allSame).toBe(false);
        });

        it('should generate codes within valid range (000000-999999)', () => {
            const codes = Array.from({ length: 50 }, () => generateVerificationCode());

            codes.forEach(code => {
                const numValue = parseInt(code, 10);
                expect(numValue).toBeGreaterThanOrEqual(0);
                expect(numValue).toBeLessThanOrEqual(999999);
            });
        });
    });
});

/**
 * This code was programmatically generated using Claude 4.5 Sonnet on February 8, 2026.
 * It has been manually reviewed and tested.
 */