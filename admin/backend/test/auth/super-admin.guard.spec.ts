import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SuperAdminGuard } from '../../src/auth/super-admin.guard';
import { createMockExecutionContext } from '../test-utils/mock-execution-context';

describe('SuperAdminGuard', () => {
  let guard: SuperAdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuperAdminGuard],
    }).compile();

    guard = module.get<SuperAdminGuard>(SuperAdminGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when user has the rst-super-admin role', () => {
    const mockContext = createMockExecutionContext({
      user: { client_roles: ['rst-super-admin'] },
    });
    expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
  });

  it('should return true when user has rst-super-admin role among other roles', () => {
    const mockContext = createMockExecutionContext({
      user: { client_roles: ['rst-admin', 'rst-super-admin', 'rst-viewer'] },
    });
    expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
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
  ])(
    'should throw ForbiddenException when user is $description',
    ({ user }) => {
      const mockContext = createMockExecutionContext({ user });
      expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow(
        ForbiddenException,
      );
    },
  );

  it('should throw ForbiddenException with the correct message', () => {
    const mockContext = createMockExecutionContext({
      user: { client_roles: ['rst-admin'] },
    });
    expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow(
      'This action requires the rst-super-admin role.',
    );
  });
});
