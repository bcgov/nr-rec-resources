import { PartnerModule } from '@/partner/partner.module';
import { describe, expect, it } from 'vitest';

describe('PartnerModule', () => {
  it('should be defined', () => {
    expect(new PartnerModule()).toBeDefined();
  });
});
