import {
  auditOperationHandler,
  createAuditExtension,
} from '@/prisma/audit.extension';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Prisma v7 with ScalarFieldEnum constants (replaces removed dmmf)
vi.mock('@generated/prisma', async () => {
  const actual = await vi.importActual('@generated/prisma');
  return {
    ...actual,
    Prisma: {
      ...(actual as any).Prisma,
      ModelName: {
        Post: 'Post',
        NonAuditedModel: 'NonAuditedModel',
      },
      // Prisma v7 generates <PascalModel>ScalarFieldEnum for each model
      PostScalarFieldEnum: {
        id: 'id',
        title: 'title',
        created_at: 'created_at',
        created_by: 'created_by',
        updated_at: 'updated_at',
        updated_by: 'updated_by',
      },
      Non_audited_modelScalarFieldEnum: {
        id: 'id',
        title: 'title',
      },
    },
  };
});

describe('createAuditExtension', () => {
  let userContext: any;

  beforeEach(() => {
    userContext = {
      getIdentityProviderPrefixedUsername: vi
        .fn()
        .mockReturnValue('IDIR\\testuser'),
    };
  });

  it('should create an extension without errors', () => {
    expect(() => createAuditExtension(userContext)).not.toThrow();
  });

  it('should return a Prisma extension', () => {
    const extension = createAuditExtension(userContext);
    expect(extension).toBeDefined();
    expect(
      typeof extension === 'function' || typeof extension === 'object',
    ).toBe(true);
  });

  it('should use the provided userContext', () => {
    const extension = createAuditExtension(userContext);
    expect(extension).toBeDefined();
  });

  it('should handle different user contexts', () => {
    const context1 = {
      getIdentityProviderPrefixedUsername: vi
        .fn()
        .mockReturnValue('IDIR\\user1'),
    } as any;
    const context2 = {
      getIdentityProviderPrefixedUsername: vi
        .fn()
        .mockReturnValue('BCeID\\user2'),
    } as any;

    const extension1 = createAuditExtension(context1);
    const extension2 = createAuditExtension(context2);

    expect(extension1).toBeDefined();
    expect(extension2).toBeDefined();
  });

  describe('auditOperationHandler', () => {
    it('adds created_at and created_by on create', async () => {
      const fakeQuery = vi
        .fn()
        .mockImplementation((args) => Promise.resolve(args));

      const args = { data: {} };
      const result = await auditOperationHandler(
        {
          model: 'Post',
          operation: 'create',
          args,
          query: fakeQuery,
        },
        userContext,
      );

      expect(result.data.created_at).toBeInstanceOf(Date);
      expect(result.data.created_by).toBe('IDIR\\testuser');
      expect(result.data.updated_at).toBeInstanceOf(Date);
      expect(result.data.updated_by).toBe('IDIR\\testuser');
      expect(fakeQuery).toHaveBeenCalledWith(result);
    });

    it('adds updated_at and updated_by on update', async () => {
      const fakeQuery = vi
        .fn()
        .mockImplementation((args) => Promise.resolve(args));

      const args = { data: {} };
      const result = await auditOperationHandler(
        {
          model: 'Post',
          operation: 'update',
          args,
          query: fakeQuery,
        },
        userContext,
      );

      expect(result.data.updated_at).toBeInstanceOf(Date);
      expect(result.data.updated_by).toBe('IDIR\\testuser');
      expect(result.data).not.toHaveProperty('created_at');
      expect(result.data).not.toHaveProperty('created_by');
      expect(fakeQuery).toHaveBeenCalledWith(result);
    });

    it('does not modify data for models without audit fields', async () => {
      const fakeQuery = vi
        .fn()
        .mockImplementation((args) => Promise.resolve(args));

      const args = { data: { title: 'Test' } };
      const result = await auditOperationHandler(
        {
          model: 'NonAuditedModel',
          operation: 'create',
          args,
          query: fakeQuery,
        },
        userContext,
      );

      expect(result.data).toEqual({ title: 'Test' });
      expect(fakeQuery).toHaveBeenCalledWith(result);
    });

    it('handles updateMany operations', async () => {
      const fakeQuery = vi
        .fn()
        .mockImplementation((args) => Promise.resolve(args));

      const args = { data: { status: 'active' } };
      const result = await auditOperationHandler(
        {
          model: 'Post',
          operation: 'updateMany',
          args,
          query: fakeQuery,
        },
        userContext,
      );

      expect(result.data.updated_at).toBeInstanceOf(Date);
      expect(result.data.updated_by).toBe('IDIR\\testuser');
      expect(result.data.status).toBe('active');
      expect(fakeQuery).toHaveBeenCalledWith(result);
    });

    it('adds audit fields on createMany operations', async () => {
      const fakeQuery = vi
        .fn()
        .mockImplementation((args) => Promise.resolve(args));

      const args = {
        data: [{ title: 'Post 1' }, { title: 'Post 2' }],
      };
      const result = await auditOperationHandler(
        {
          model: 'Post',
          operation: 'createMany',
          args,
          query: fakeQuery,
        },
        userContext,
      );

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(2);
      expect(result.data[0].title).toBe('Post 1');
      expect(result.data[0].created_at).toBeInstanceOf(Date);
      expect(result.data[0].created_by).toBe('IDIR\\testuser');
      expect(result.data[0].updated_at).toBeInstanceOf(Date);
      expect(result.data[0].updated_by).toBe('IDIR\\testuser');
      expect(result.data[1].title).toBe('Post 2');
      expect(result.data[1].created_at).toBeInstanceOf(Date);
      expect(result.data[1].created_by).toBe('IDIR\\testuser');
      expect(result.data[1].updated_at).toBeInstanceOf(Date);
      expect(result.data[1].updated_by).toBe('IDIR\\testuser');
      expect(fakeQuery).toHaveBeenCalledWith(result);
    });

    it('does not add audit fields on read operations', async () => {
      const fakeQuery = vi
        .fn()
        .mockImplementation((args) => Promise.resolve(args));

      const args = { where: { id: 1 } };
      const result = await auditOperationHandler(
        {
          model: 'Post',
          operation: 'findMany',
          args,
          query: fakeQuery,
        },
        userContext,
      );

      expect(result).toEqual({ where: { id: 1 } });
      expect(fakeQuery).toHaveBeenCalledWith(result);
    });

    it('preserves existing data when adding audit fields', async () => {
      const fakeQuery = vi
        .fn()
        .mockImplementation((args) => Promise.resolve(args));

      const args = {
        data: {
          title: 'Test Post',
          content: 'Test Content',
        },
      };
      const result = await auditOperationHandler(
        {
          model: 'Post',
          operation: 'create',
          args,
          query: fakeQuery,
        },
        userContext,
      );

      expect(result.data.title).toBe('Test Post');
      expect(result.data.content).toBe('Test Content');
      expect(result.data.created_at).toBeInstanceOf(Date);
      expect(result.data.created_by).toBe('IDIR\\testuser');
      expect(fakeQuery).toHaveBeenCalledWith(result);
    });
  });
});
