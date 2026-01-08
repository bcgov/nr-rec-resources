import { formatImageUrls } from './formatImageUrls';
import { RecreationResourceImageSize } from '@shared/constants/images';

describe('formatImageUrls', () => {
  const mockImages = [{ image_id: 'img-uuid-1' }, { image_id: 'img-uuid-2' }];
  const recResourceId = 'REC123456';
  const baseUrl = 'https://cdn.example.com';

  it('should return only original size by default', () => {
    const result = formatImageUrls({
      images: mockImages,
      recResourceId,
      baseUrl,
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      image_id: 'img-uuid-1',
      url: {
        original:
          'https://cdn.example.com/images/REC123456/img-uuid-1/original.webp',
      },
    });
    expect(result[1]).toEqual({
      image_id: 'img-uuid-2',
      url: {
        original:
          'https://cdn.example.com/images/REC123456/img-uuid-2/original.webp',
      },
    });
  });

  it('should return only requested size codes', () => {
    const result = formatImageUrls({
      images: mockImages,
      recResourceId,
      baseUrl,
      imageSizeCodes: [
        RecreationResourceImageSize.THUMBNAIL,
        RecreationResourceImageSize.PREVIEW,
      ],
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      image_id: 'img-uuid-1',
      url: {
        thm: 'https://cdn.example.com/images/REC123456/img-uuid-1/thm.webp',
        pre: 'https://cdn.example.com/images/REC123456/img-uuid-1/pre.webp',
      },
    });
    // Should NOT have original or scr
    expect(result[0].url).not.toHaveProperty('original');
    expect(result[0].url).not.toHaveProperty('scr');
  });

  it('should handle empty images array', () => {
    const result = formatImageUrls({ images: [], recResourceId, baseUrl });
    expect(result).toEqual([]);
  });
});
