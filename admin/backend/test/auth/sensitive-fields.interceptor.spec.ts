import { CallHandler, ExecutionContext } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import {
  RecreationResourceAuthRole,
  isIdirViewerOnly,
  SensitiveFieldsInterceptor,
} from '@/auth';
import { createMockExecutionContext } from '../test-utils/mock-execution-context';

describe('isIdirViewerOnly', () => {
  it('returns true when rst-idir-viewer is the only RST role', () => {
    expect(
      isIdirViewerOnly([
        RecreationResourceAuthRole.RST_IDIR_VIEWER,
        RecreationResourceAuthRole.ACT_SERVICE,
      ]),
    ).toBe(true);
  });

  it('returns false when user has rst-idir-viewer and another RST role', () => {
    expect(
      isIdirViewerOnly([
        RecreationResourceAuthRole.RST_IDIR_VIEWER,
        RecreationResourceAuthRole.RST_ADMIN,
      ]),
    ).toBe(false);
  });

  it('returns false when rst-idir-viewer is missing', () => {
    expect(isIdirViewerOnly([RecreationResourceAuthRole.RST_VIEWER])).toBe(
      false,
    );
  });
});

describe('SensitiveFieldsInterceptor', () => {
  const interceptor = new SensitiveFieldsInterceptor();

  const runIntercept = async (
    requestUser: unknown,
    payload: unknown,
  ): Promise<unknown> => {
    const context = createMockExecutionContext({
      user: requestUser,
    }) as ExecutionContext;

    const next: CallHandler = {
      handle: vi.fn(() => of(payload)),
    };

    return firstValueFrom(interceptor.intercept(context, next));
  };

  it('does not redact when request has no user', async () => {
    const payload = {
      estimated_repair_cost: 123,
      actual_repair_cost: 456,
      recreation_agreement_holder: 'Name',
    };

    const result = await runIntercept(undefined, payload);

    expect(result).toBe(payload);
    expect(payload).toEqual({
      estimated_repair_cost: 123,
      actual_repair_cost: 456,
      recreation_agreement_holder: 'Name',
    });
  });

  it('does not redact when user has a non-viewer role', async () => {
    const payload = {
      estimated_repair_cost: 123,
      nested: {
        actual_repair_cost: 456,
      },
    };

    await runIntercept(
      { client_roles: [RecreationResourceAuthRole.RST_ADMIN] },
      payload,
    );

    expect(payload.estimated_repair_cost).toBe(123);
    expect(payload.nested.actual_repair_cost).toBe(456);
  });

  it('redacts sensitive fields for viewer-only users, including nested objects and arrays', async () => {
    const payload = {
      estimated_repair_cost: 123,
      nested: {
        actual_repair_cost: 456,
        items: [
          {
            recreation_agreement_holder: 'Holder A',
            keep: 'value',
          },
        ],
      },
    };

    const result = await runIntercept(
      { client_roles: [RecreationResourceAuthRole.RST_IDIR_VIEWER] },
      payload,
    );

    expect(result).toBe(payload);
    expect(payload).toEqual({
      estimated_repair_cost: null,
      nested: {
        actual_repair_cost: null,
        items: [
          {
            recreation_agreement_holder: null,
            keep: 'value',
          },
        ],
      },
    });
  });

  it('does not descend into geometry, shape, or coordinates keys', async () => {
    const payload = {
      geometry: {
        estimated_repair_cost: 999,
      },
      shape: {
        actual_repair_cost: 888,
      },
      coordinates: {
        recreation_agreement_holder: 'Hidden',
      },
      details: {
        estimated_repair_cost: 100,
      },
    };

    await runIntercept(
      { client_roles: [RecreationResourceAuthRole.RST_IDIR_VIEWER] },
      payload,
    );

    expect(payload.geometry.estimated_repair_cost).toBe(999);
    expect(payload.shape.actual_repair_cost).toBe(888);
    expect(payload.coordinates.recreation_agreement_holder).toBe('Hidden');
    expect(payload.details.estimated_repair_cost).toBeNull();
  });

  it('handles circular references without throwing and still redacts', async () => {
    const payload: Record<string, unknown> = {
      estimated_repair_cost: 321,
    };
    payload.self = payload;

    await expect(
      runIntercept(
        { client_roles: [RecreationResourceAuthRole.RST_IDIR_VIEWER] },
        payload,
      ),
    ).resolves.toBe(payload);

    expect(payload.estimated_repair_cost).toBeNull();
  });
});
