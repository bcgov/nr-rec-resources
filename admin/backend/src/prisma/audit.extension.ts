import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { Prisma } from '@generated/prisma';

const AUDIT_FIELDS = ['created_by', 'updated_by', 'created_at', 'updated_at'];

/**
 * Lazily detects which Prisma models have audit fields using Prisma v7's
 * runtime ScalarFieldEnum metadata. Computed once on first use.
 *
 * Prisma v7 removed `Prisma.dmmf` (the DMMF metadata object) with no
 * replacement API. This workaround introspects the generated
 * `<Model>ScalarFieldEnum` constants instead.
 * https://github.com/prisma/prisma/issues/27028
 */
const getModelAuditFields = (() => {
  let cache: Map<string, Set<string>> | null = null;

  return (modelName: string): Set<string> | undefined => {
    if (cache) return cache.get(modelName);

    const prismaNamespace = Prisma as unknown as Record<string, unknown>;
    cache = new Map<string, Set<string>>();

    for (const name of Object.values(Prisma.ModelName)) {
      const enumKey =
        name.charAt(0).toUpperCase() + name.slice(1) + 'ScalarFieldEnum';
      const fields = prismaNamespace[enumKey];
      if (!fields || typeof fields !== 'object') continue;

      const fieldNames = Object.values(fields as Record<string, string>);
      const present = AUDIT_FIELDS.filter((f) => fieldNames.includes(f));

      if (present.length > 0) {
        cache.set(name, new Set(present));
      }
    }
    return cache.get(modelName);
  };
})();

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

  const auditFields = getModelAuditFields(model);
  if (!auditFields) {
    return query(args);
  }

  const timestamp = new Date();
  const username = userContext.getIdentityProviderPrefixedUsername();
  const hasCreatedAt = auditFields.has('created_at');
  const hasCreatedBy = auditFields.has('created_by');
  const hasUpdatedAt = auditFields.has('updated_at');
  const hasUpdatedBy = auditFields.has('updated_by');

  const addCreateAuditFields = (data: any) => ({
    ...data,
    ...(hasCreatedAt && { created_at: timestamp }),
    ...(hasCreatedBy && { created_by: username }),
    ...(hasUpdatedAt && { updated_at: timestamp }),
    ...(hasUpdatedBy && { updated_by: username }),
  });

  // CREATE
  if (operation === 'create') {
    args.data = addCreateAuditFields(args.data);
  }

  // CREATE MANY
  if (operation === 'createMany') {
    if (Array.isArray(args.data)) {
      args.data = args.data.map(addCreateAuditFields);
    }
  }

  // UPDATE / UPDATE MANY
  if (
    (operation === 'update' || operation === 'updateMany') &&
    (hasUpdatedAt || hasUpdatedBy)
  ) {
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
