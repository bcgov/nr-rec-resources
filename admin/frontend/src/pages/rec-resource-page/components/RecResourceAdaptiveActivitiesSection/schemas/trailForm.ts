import { z } from 'zod';

export const TRAIL_TYPE_OPTIONS = [
  { id: 'GREEN', label: 'Green (Easy)' },
  { id: 'BLUE', label: 'Blue (Intermediate)' },
  { id: 'BLACK', label: 'Black (Advanced)' },
] as const;

export const trailFormSchema = z.object({
  trail_type: z.enum(['GREEN', 'BLUE', 'BLACK']),
  name: z
    .string()
    .min(1, 'Trail name is required')
    .max(120, 'Trail name must be 120 characters or fewer'),
  description: z.string().optional(),
});

export type TrailFormData = z.infer<typeof trailFormSchema>;
