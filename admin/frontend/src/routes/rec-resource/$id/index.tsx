import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/rec-resource/$id/')({
  beforeLoad: () => {
    throw redirect({
      to: '/rec-resource/$id/files',
    });
  },
});
