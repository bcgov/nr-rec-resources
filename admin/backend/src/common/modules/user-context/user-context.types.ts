/**
 * Type for authentication identity provider names.
 *
 * - `IDIR`   - default for interactive admin users (RST UI).
 * - `SERVICE` - service-account contexts (e.g. the Act integration
 *   authenticated via the OAuth2 Client Credentials flow). The
 *   "username" portion is the CSS client / service identifier.
 */
export type AuthIdentityProviderName = 'IDIR' | 'SERVICE';
