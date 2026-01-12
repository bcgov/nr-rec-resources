import { KeycloakUserToken } from '@/auth/auth.types';
import { UnauthorizedUserException } from '@/common/exceptions/unauthorized-user.exception';
import { AuthIdentityProviderName } from '@/common/modules/user-context/user-context.types';
import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

/**
 * Service for accessing the current user's context.
 * Uses CLS (Continuation Local Storage) to maintain request-specific user data.
 */
@Injectable()
export class UserContextService {
  private readonly USER_KEY = 'user';
  private readonly IDENTITY_PROVIDER_KEY = 'identityProvider';
  private readonly DEFAULT_IDENTITY_PROVIDER = 'IDIR';

  constructor(private readonly cls: ClsService) {}

  /**
   * Gets the current user's IDIR username
   * @throws {UnauthorizedUserException} If user is not authenticated or missing IDIR username
   */
  getCurrentUserName(): string {
    const user = this.cls.get<KeycloakUserToken>(this.USER_KEY);

    if (!user?.idir_username) {
      throw new UnauthorizedUserException();
    }

    return user.idir_username;
  }

  /**
   * Gets the current user's identity provider prefixed username
   * @returns The identity provider username in the format "<provider>\<username>"
   */
  getIdentityProviderPrefixedUsername(): string {
    return `${this.cls.get(this.IDENTITY_PROVIDER_KEY)}\\${this.getCurrentUserName()}`;
  }

  /**
   * Sets the current user's context
   * @param user The user token information
   * @param identityProvider The identity provider name (default: IDIR)
   */
  setCurrentUser(
    user: KeycloakUserToken,
    identityProvider?: AuthIdentityProviderName,
  ): void {
    this.cls.set(this.USER_KEY, user);
    this.cls.set(
      this.IDENTITY_PROVIDER_KEY,
      identityProvider || this.DEFAULT_IDENTITY_PROVIDER,
    );
  }

  /**
   * Gets the current user's token information
   * @throws {UnauthorizedUserException} If user is not authenticated
   */
  getCurrentUser(): KeycloakUserToken {
    const user = this.cls.get<KeycloakUserToken>(this.USER_KEY);

    if (!user) {
      throw new UnauthorizedUserException();
    }

    return user;
  }
}
