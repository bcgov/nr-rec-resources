import type { AuthIdentityProviderName } from '@/common/modules/user-context/user-context.types';
import { describe, expect, it } from 'vitest';

describe('UserContextTypes', () => {
  describe('AuthIdentityProviderName', () => {
    it('should accept IDIR as valid identity provider', () => {
      const provider: AuthIdentityProviderName = 'IDIR';
      expect(provider).toBe('IDIR');
    });

    it('should be a string type', () => {
      const provider: AuthIdentityProviderName = 'IDIR';
      expect(typeof provider).toBe('string');
    });
  });
});
