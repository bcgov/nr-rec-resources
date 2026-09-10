import { AgreementHolderClientPublicViewDto } from '@/partner/dtos/agreement-holder-client-public-view.dto';
import { ClientLocationDto } from '@/partner/dtos/client-location.dto';
import { ClientPublicViewDto } from '@/partner/dtos/client-public-view.dto';
import { CreateAgreementHolderDto } from '@/partner/dtos/create-agreement-holder.dto';
import { UpdateAgreementHolderDto } from '@/partner/dtos/update-agreement-holder.dto';
import { describe, expect, it } from 'vitest';

describe('Partner DTOs', () => {
  it('should instantiate the public client dto', () => {
    const dto = new ClientPublicViewDto();
    dto.clientNumber = '00000002';
    dto.clientStatusCode = 'ACT';
    dto.clientStatusDescription = 'Active';
    dto.clientTypeCode = 'I';
    dto.clientTypeDescription = 'Individual';

    expect(dto.clientNumber).toBe('00000002');
    expect(dto.clientTypeDescription).toBe('Individual');
  });

  it('should instantiate the agreement holder dto', () => {
    const dto = new AgreementHolderClientPublicViewDto();
    dto.agreementStartDate = '2024-01-01';
    dto.agreementEndDate = '2026-12-31';
    dto.visible_on_public_website = false;
    dto.partner_relationship_type_code = 'SITE_OPERATOR';

    expect(dto.agreementStartDate).toBe('2024-01-01');
    expect(dto.agreementEndDate).toBe('2026-12-31');
    expect(dto.partner_relationship_type_code).toBe('SITE_OPERATOR');
  });

  it('should instantiate the client location dto', () => {
    const dto = new ClientLocationDto();
    dto.clientNumber = '00000002';
    dto.clientName = 'BAXTER';
    dto.locationCode = '00';

    expect(dto.clientNumber).toBe('00000002');
    expect(dto.locationCode).toBe('00');
  });

  it('should instantiate the create agreement holder dto', () => {
    const dto = new CreateAgreementHolderDto();
    dto.clientNumber = '00000002';
    dto.agreementStartDate = '2024-01-01';
    dto.agreementEndDate = '2026-12-31';
    dto.visible_on_public_website = false;
    dto.partner_relationship_type_code = 'SITE_OPERATOR';

    expect(dto.clientNumber).toBe('00000002');
    expect(dto.agreementEndDate).toBe('2026-12-31');
    expect(dto.partner_relationship_type_code).toBe('SITE_OPERATOR');
  });

  it('should instantiate the update agreement holder dto', () => {
    const dto = new UpdateAgreementHolderDto();
    dto.agreementStartDate = '2024-02-01';
    dto.visible_on_public_website = true;
    dto.partner_relationship_type_code = 'SITE_OPERATOR';

    expect(dto.agreementStartDate).toBe('2024-02-01');
    expect(dto.visible_on_public_website).toBe(true);
    expect(dto.partner_relationship_type_code).toBe('SITE_OPERATOR');
  });
});
