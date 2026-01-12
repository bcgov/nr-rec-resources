import { KeycloakUserToken } from '@/auth/auth.types';
import { UnauthorizedUserException } from '@/common/exceptions/unauthorized-user.exception';
import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { ClsService } from 'nestjs-cls';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';

describe('UserContextService', () => {
  let service: UserContextService;
  let clsService: Mocked<ClsService>;

  beforeEach(() => {
    clsService = {
      get: vi.fn(),
      set: vi.fn(),
    } as unknown as Mocked<ClsService>;
    service = new UserContextService(clsService);
  });

  describe('getCurrentUserName', () => {
    it('should return the current user IDIR username', () => {
      const mockUser: KeycloakUserToken = {
        sub: '123',
        iss: 'https://issuer',
        idir_username: 'testuser',
        preferred_username: 'testuser@idir',
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
      };
      clsService.get.mockReturnValue(mockUser);

      const result = service.getCurrentUserName();

      expect(result).toBe('testuser');
      expect(clsService.get).toHaveBeenCalledWith('user');
    });

    it('should throw UnauthorizedUserException if user is not set', () => {
      clsService.get.mockReturnValue(null);

      expect(() => service.getCurrentUserName()).toThrow(
        UnauthorizedUserException,
      );
      expect(() => service.getCurrentUserName()).toThrow(
        'User is not properly authenticated',
      );
    });

    it('should throw UnauthorizedUserException if user has no idir_username', () => {
      const mockUser = {
        sub: '123',
        iss: 'https://issuer',
        preferred_username: 'testuser@idir',
        email: 'test@example.com',
      } as KeycloakUserToken;
      clsService.get.mockReturnValue(mockUser);

      expect(() => service.getCurrentUserName()).toThrow(
        UnauthorizedUserException,
      );
      expect(() => service.getCurrentUserName()).toThrow(
        'User is not properly authenticated',
      );
    });
  });

  describe('getIdentityProviderPrefixedUsername', () => {
    it('should return identity provider prefixed username', () => {
      const mockUser: KeycloakUserToken = {
        sub: '123',
        iss: 'https://issuer',
        idir_username: 'testuser',
        preferred_username: 'testuser@idir',
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
      };
      clsService.get.mockImplementation((key: string) => {
        if (key === 'user') return mockUser;
        if (key === 'identityProvider') return 'IDIR';
        return undefined;
      });

      const result = service.getIdentityProviderPrefixedUsername();

      expect(result).toBe('IDIR\\testuser');
    });

    it('should handle custom identity provider', () => {
      const mockUser: KeycloakUserToken = {
        sub: '123',
        iss: 'https://issuer',
        idir_username: 'bceiduser',
        preferred_username: 'bceiduser@bceid',
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
      };
      clsService.get.mockImplementation((key: string) => {
        if (key === 'user') return mockUser;
        if (key === 'identityProvider') return 'IDIR'; // Note: Only IDIR is supported per types
        return undefined;
      });

      const result = service.getIdentityProviderPrefixedUsername();

      expect(result).toBe('IDIR\\bceiduser');
    });
  });

  describe('setCurrentUser', () => {
    it('should set user and default identity provider', () => {
      const mockUser: KeycloakUserToken = {
        sub: '123',
        iss: 'https://issuer',
        idir_username: 'testuser',
        preferred_username: 'testuser@idir',
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
      };

      service.setCurrentUser(mockUser);

      expect(clsService.set).toHaveBeenCalledWith('user', mockUser);
      expect(clsService.set).toHaveBeenCalledWith('identityProvider', 'IDIR');
    });

    it('should set user and explicit IDIR identity provider', () => {
      const mockUser: KeycloakUserToken = {
        sub: '123',
        iss: 'https://issuer',
        idir_username: 'idiruser',
        preferred_username: 'idiruser@idir',
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
      };

      service.setCurrentUser(mockUser, 'IDIR');

      expect(clsService.set).toHaveBeenCalledWith('user', mockUser);
      expect(clsService.set).toHaveBeenCalledWith('identityProvider', 'IDIR');
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user token', () => {
      const mockUser: KeycloakUserToken = {
        sub: '123',
        iss: 'https://issuer',
        idir_username: 'testuser',
        preferred_username: 'testuser@idir',
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
      };
      clsService.get.mockReturnValue(mockUser);

      const result = service.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(clsService.get).toHaveBeenCalledWith('user');
    });

    it('should throw UnauthorizedUserException if user is not set', () => {
      clsService.get.mockReturnValue(null);

      expect(() => service.getCurrentUser()).toThrow(UnauthorizedUserException);
      expect(() => service.getCurrentUser()).toThrow(
        'User is not properly authenticated',
      );
    });
  });
});
