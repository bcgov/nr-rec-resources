import { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { RecreationResourceAuthRole } from '../../src/auth/auth.constants';
import { createMockExecutionContext } from '../test-utils/mock-execution-context';
import { IsSuperAdmin } from '../../src/auth/is-super-admin.decorator';

const state = vi.hoisted(() => ({
  factory: null as ((_data: unknown, ctx: ExecutionContext) => boolean) | null,
}));

vi.mock('@nestjs/common', async () => ({
  ...(await vi.importActual('@nestjs/common')),
  createParamDecorator: vi
    .fn()
    .mockImplementation(
      (factory: (_data: unknown, ctx: ExecutionContext) => boolean) => {
        state.factory = factory;
        return vi.fn();
      },
    ),
}));

describe('IsSuperAdmin Decorator', () => {
  it('should export the IsSuperAdmin decorator', () => {
    expect(IsSuperAdmin).toBeDefined();
  });

  it('should register a factory via createParamDecorator', () => {
    expect(state.factory).not.toBeNull();
  });

  it('should return true when user has the rst-super-admin role', () => {
    const mockContext = createMockExecutionContext({
      user: { client_roles: [RecreationResourceAuthRole.RST_SUPER_ADMIN] },
    });
    expect(state.factory!(undefined, mockContext as ExecutionContext)).toBe(
      true,
    );
  });

  it('should return true when user has rst-super-admin among other roles', () => {
    const mockContext = createMockExecutionContext({
      user: {
        client_roles: [
          'rst-admin',
          RecreationResourceAuthRole.RST_SUPER_ADMIN,
          'rst-viewer',
        ],
      },
    });
    expect(state.factory!(undefined, mockContext as ExecutionContext)).toBe(
      true,
    );
  });

  it.each([
    {
      description: 'missing the rst-super-admin role',
      user: { client_roles: ['rst-admin', 'rst-viewer'] },
    },
    {
      description: 'with an empty client_roles array',
      user: { client_roles: [] },
    },
    {
      description: 'without client_roles property',
      user: {},
    },
    {
      description: 'without a user object',
      user: undefined,
    },
  ])('should return false when user is $description', ({ user }) => {
    const mockContext = createMockExecutionContext({ user });
    expect(state.factory!(undefined, mockContext as ExecutionContext)).toBe(
      false,
    );
  });
});
