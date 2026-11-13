import { type ReactNode } from 'react';

export function getPublicAccessStatusHelpText(): ReactNode {
  return (
    <>
      <p className="mb-0">
        Public access status indicates the current level of public access to the
        resource based on closures, restrictions, wildfires, evacuation orders,
        or other access impacts.
      </p>
      <p className="mb-0 mt-2">
        Refer to the{' '}
        <a
          href="https://intranet.gov.bc.ca/intranet/content?id=EA54D3E5200F4A2BA2110C284D72DD31"
          target="_blank"
          rel="noreferrer"
        >
          guidance documentation
        </a>{' '}
        for definitions of each access status.
      </p>
    </>
  );
}
