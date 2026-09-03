import { type ReactNode } from 'react';

export function getPublicAccessStatusHelpText(): ReactNode {
  return (
    <>
      <p className="mb-0">
        Public Access Status indicates the current level of public access to the
        resource based on closures, restrictions, wildfires, evacuation orders,
        or other access impacts.
      </p>
      <p className="mb-0 mt-2">
        Refer to the guidance documentation for definitions of each access
        status.
      </p>
      <a
        href="https://apps.nrs.gov.bc.ca/int/confluence/display/BCPRS/Access-status"
        target="_blank"
        rel="noreferrer"
      >
        View guidance documentation
      </a>
    </>
  );
}
