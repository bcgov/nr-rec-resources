# 🔐 Authentication & Authorization Implementation Guide

Our web-based admin interface implements secure authentication using BC Gov SSO
(Keycloak), following modern best practices for browser-based applications.

Key Implementation Features:

- Uses Public Client with PKCE authentication flow
- Integrates with BC Gov SSO (powered by Keycloak)
- Follows industry-standard security practices

The authentication process is divided into two main components:

- Frontend (React): Handles user login through browser-based authentication flow
  and token retrieval
- Backend (NestJS): Manages token validation and security enforcement

## Architecture Overview

![img](./auth-flow-diagram.png)

## Frontend Authentication

### Setup and Configuration

The frontend uses `keycloak-js` to handle authentication.

### Key Components

1. **Keycloak Initialization**

- The Keycloak client needs to be initialized when the application starts
- Configuration includes the Keycloak server URL, realm, and client ID

### Authentication Flow

**Login Process**

- When an unauthenticated user tries to access a protected route, they are
  redirected to the BC Gov login page
- After successful authentication, users are redirected back to the application
  with an access token
- The token is stored and used for subsequent API requests

**Token Management**

- Access tokens are automatically managed by the Keycloak client
- Token refresh is handled automatically when tokens expire
- Tokens are included in API requests via Authorization headers

**Logout Process**

- When users log out, they are redirected to SSO logout endpoint
- The session is terminated both in the application and SSO server
- All local tokens are cleared

## Backend Authentication

### Setup and Configuration

The backend uses:

- `@nestjs/passport` (v11.0.5)
- `passport-keycloak-bearer` (v2.4.1)
- `passport` (v0.7.0)

### Authentication Components

**Authentication Guard**

- Protects routes requiring authentication
- Validates incoming JWT tokens
- Integrates with NestJS's guard system

**Token Validation**

- Validates tokens against Keycloak's public key
- Verifies token signature, expiration, and required claims
- Checks token permissions and roles if required

### Token Security & Access Control

Our token security implementation includes:

- Mandatory token validation on every request
- Strict token expiration enforcement
- Role-based access control (RBAC) using token claims

### RBAC Implementation

Role-Based Access Control (RBAC) restricts access to specific routes based on
user roles in token claims. NestJS implements this through a combination of
guards and decorators.

Here's how to protect routes using the @AuthRoles decorator:

```tsx
@UseGuards(AuthGuard('keycloak'), RolesGuard)
@AuthRoles('rst-admin', 'rst-rec-tech')
@Get('/secure-data')
getSecureData() {
   return 'Protected by role-based access';
}
```

## API Authentication Flow

### Token Validation Process

The Passport library handles JWT token validation through these sequential
steps:

1. Token Extraction
   - Retrieves Bearer token from Authorization header
2. Signature Verification
   - Validates token signature using Keycloak's JWKS endpoint public key
3. Claims Validation
   - Verifies token issuer matches configured Keycloak realm
   - Validates audience claim against client ID
   - Checks token expiration status
4. Payload Processing
   - Processes decoded token payload through validate() method if all checks
     pass
   - Note: Currently no additional validation logic implemented

### Request Flow

For protected routes (using `AuthGuard`):

- Frontend sends access token in Authorization header
- Backend validates token automatically
  - Protection enabled via `@UseGuards` decorator on controllers/routes
- Invalid or expired tokens receive 401 Unauthorized response

## Environment Configuration

Both frontend and backend require proper environment configuration:

### Frontend Environment Variables

```

VITE_KEYCLOAK_URL=<keycloak-server-url>
VITE_KEYCLOAK_REALM=<realm-name>
VITE_KEYCLOAK_CLIENT_ID=<client-id>

```

### Backend Environment Variables

```

KEYCLOAK_REALM_URL=<keycloak-realm-url>
KEYCLOAK_CLIENT_ID=<client-id>

```
