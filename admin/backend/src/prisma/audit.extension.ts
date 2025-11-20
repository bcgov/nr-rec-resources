import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { Prisma } from '@prisma/client';

/**
 * Audit operation handler that adds audit fields to create and update operations
 * @internal Exported for testing purposes
 */
export async function auditOperationHandler(
  params: {
    model: string;
    operation: string;
    args: any;
    query: (args: any) => Promise<any>;
  },
  userContext: UserContextService,
) {
  const { model, operation, args, query } = params;
  const timestamp = new Date();

  // Determine audit strategy from schema
  const modelMeta = Prisma.dmmf?.datamodel?.models?.find(
    (m: any) => m.name === model,
  );
  const fieldNames = new Set(modelMeta?.fields?.map((f: any) => f.name) || []);
  const hasCreatedAt = fieldNames.has('created_at');
  const hasCreatedBy = fieldNames.has('created_by');
  const hasUpdatedAt = fieldNames.has('updated_at');
  const hasUpdatedBy = fieldNames.has('updated_by');

  // CREATE
  if (operation === 'create' && (hasCreatedAt || hasCreatedBy)) {
    const username = userContext.getIdentityProviderPrefixedUsername();
    args.data = {
      ...args.data,
      ...(hasCreatedAt && { created_at: timestamp }),
      ...(hasCreatedBy && { created_by: username }),
      ...(hasUpdatedAt && { updated_at: timestamp }),
      ...(hasUpdatedBy && { updated_by: username }),
    };
  }

  // UPDATE / UPDATE MANY
  if (
    (operation === 'update' || operation === 'updateMany') &&
    (hasUpdatedAt || hasUpdatedBy)
  ) {
    const username = userContext.getIdentityProviderPrefixedUsername();
    args.data = {
      ...args.data,
      ...(hasUpdatedAt && { updated_at: timestamp }),
      ...(hasUpdatedBy && { updated_by: username }),
    };
  }

  return query(args);
}

// future: all prisma related files should belong in its module specific folder
export function createAuditExtension(userContext: UserContextService) {
  return Prisma.defineExtension({
    name: 'audit-extension',
    query: {
      $allModels: {
        async $allOperations(params: any) {
          return auditOperationHandler(params, userContext);
        },
      },
    },
  });
}
