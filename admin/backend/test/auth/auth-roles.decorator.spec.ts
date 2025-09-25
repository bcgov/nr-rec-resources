import { AuthRoles } from '../../src/auth';
import { SetMetadata } from '@nestjs/common';

// Mock the SetMetadata function from NestJS
vi.mock('@nestjs/common', async () => ({
  ...(await vi.importActual('@nestjs/common')),
  SetMetadata: vi.fn().mockImplementation((key, value) => ({ key, value })),
}));

describe('Roles Decorator', () => {
  it('should call SetMetadata with the correct key and roles', () => {
    // Test with a single role
    const decorator = AuthRoles(['admin']);

    expect(SetMetadata).toHaveBeenCalledWith('roles', {
      roles: ['admin'],
      mode: 'any',
    });
    expect(decorator).toEqual({
      key: 'roles',
      value: { roles: ['admin'], mode: 'any' },
    });
  });

  it('should handle multiple roles', () => {
    // Test with multiple roles
    const decorator = AuthRoles(['admin', 'user', 'editor']);

    expect(SetMetadata).toHaveBeenCalledWith('roles', {
      roles: ['admin', 'user', 'editor'],
      mode: 'any',
    });
    expect(decorator).toEqual({
      key: 'roles',
      value: { roles: ['admin', 'user', 'editor'], mode: 'any' },
    });
  });

  it('should work with empty roles array', () => {
    // Test with no roles
    const decorator = AuthRoles([]);

    expect(SetMetadata).toHaveBeenCalledWith('roles', {
      roles: [],
      mode: 'any',
    });
    expect(decorator).toEqual({
      key: 'roles',
      value: { roles: [], mode: 'any' },
    });
  });
});
