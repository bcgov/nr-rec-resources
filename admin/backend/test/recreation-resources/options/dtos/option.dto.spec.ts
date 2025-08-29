import {
  CreateOptionDto,
  DeleteOptionResponseDto,
  OptionDto,
  UpdateOptionDto,
} from '@/recreation-resources/options/dtos/option.dto';

describe('Option DTOs', () => {
  describe('OptionDto', () => {
    it('should create a valid OptionDto with all fields', () => {
      const dto = new OptionDto();
      dto.id = 'hiking';
      dto.label = 'Hiking';
      dto.children = [];

      const child1 = new OptionDto();
      child1.id = 'hiking_trail';
      child1.label = 'Hiking Trail';

      const child2 = new OptionDto();
      child2.id = 'hiking_backcountry';
      child2.label = 'Backcountry Hiking';

      dto.children.push(child1, child2);

      expect(dto.id).toBe('hiking');
      expect(dto.label).toBe('Hiking');
      expect(dto.children).toHaveLength(2);
      expect(dto.children?.[0]?.id).toBe('hiking_trail');
    });

    it('should create a valid OptionDto without children', () => {
      const dto = new OptionDto();
      dto.id = 'biking';
      dto.label = 'Biking';

      expect(dto.id).toBe('biking');
      expect(dto.label).toBe('Biking');
      expect(dto.children).toBeUndefined();
    });
  });

  describe('CreateOptionDto', () => {
    it('should create a valid CreateOptionDto', () => {
      const dto = new CreateOptionDto();
      dto.label = 'Backpacking';

      expect(dto.label).toBe('Backpacking');
    });
  });

  describe('UpdateOptionDto', () => {
    it('should create a valid UpdateOptionDto', () => {
      const dto = new UpdateOptionDto();
      dto.label = 'Backpacking & Camping';

      expect(dto.label).toBe('Backpacking & Camping');
    });
  });

  describe('DeleteOptionResponseDto', () => {
    it('should create a valid DeleteOptionResponseDto with success true', () => {
      const dto = new DeleteOptionResponseDto();
      dto.success = true;

      expect(dto.success).toBe(true);
    });

    it('should create a valid DeleteOptionResponseDto with success false', () => {
      const dto = new DeleteOptionResponseDto();
      dto.success = false;

      expect(dto.success).toBe(false);
    });
  });
});
