import { PrismaService } from '@/prisma.service';
import { OptionsRepository } from '@/recreation-resources/options/options.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('OptionsRepository', () => {
  let repository: OptionsRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  const mockTableMapping = {
    idField: 'recreation_activity_code',
    labelField: 'description',
    prismaModel: 'recreation_activity_code',
  };

  const mockDistrictMapping = {
    idField: 'district_code',
    labelField: 'description',
    prismaModel: 'recreation_district_code',
    archivedField: 'is_archived',
  };

  const createPrismaModel = () => ({
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  });

  beforeEach(async () => {
    const mockPrismaService = {
      recreation_activity_code: createPrismaModel(),
      recreation_feature_code: createPrismaModel(),
      recreation_status_code: createPrismaModel(),
      recreation_access_code: { findUnique: vi.fn() },
      recreation_access_and_sub_access_code: { findMany: vi.fn() },
      recreation_sub_access_code: createPrismaModel(),
      recreation_access: { findFirst: vi.fn() },
      recreation_district_code: createPrismaModel(),
      $transaction: vi.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        OptionsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<OptionsRepository>(OptionsRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    if (module) {
      await module.close();
    }
  });

  describe('findAllByType', () => {
    it.each([
      {
        name: 'activities',
        mapping: mockTableMapping,
        mockResults: [
          { recreation_activity_code: 1, description: 'Hiking' },
          { recreation_activity_code: 2, description: 'Skiing' },
        ],
        expected: [
          { id: '1', label: 'Hiking' },
          { id: '2', label: 'Skiing' },
        ],
        model: 'recreation_activity_code',
      },
      {
        name: 'feature codes',
        mapping: {
          idField: 'recreation_feature_code',
          labelField: 'description',
          prismaModel: 'recreation_feature_code',
        },
        mockResults: [
          { recreation_feature_code: 'C01', description: 'Campground' },
          { recreation_feature_code: 'T01', description: 'Trail' },
        ],
        expected: [
          { id: 'C01', label: 'Campground' },
          { id: 'T01', label: 'Trail' },
        ],
        model: 'recreation_feature_code',
      },
      {
        name: 'recreation status',
        mapping: {
          idField: 'status_code',
          labelField: 'description',
          prismaModel: 'recreation_status_code',
        },
        mockResults: [
          { status_code: 1, description: 'Active' },
          { status_code: 2, description: 'Inactive' },
        ],
        expected: [
          { id: '1', label: 'Active' },
          { id: '2', label: 'Inactive' },
        ],
        model: 'recreation_status_code',
      },
    ])(
      'should return all options for $name',
      async ({ mapping, mockResults, expected, model }) => {
        (prisma as any)[model].findMany.mockResolvedValue(mockResults);

        const result = await repository.findAllByType(mapping);

        expect(result).toEqual(expected);
        expect((prisma as any)[model].findMany).toHaveBeenCalledWith({
          select: expect.objectContaining({
            [mapping.idField]: true,
            [mapping.labelField]: true,
          }),
          orderBy: { [mapping.labelField]: 'asc' },
        });
      },
    );

    it('should use middleware when mapping has one', async () => {
      const mockAccessMapping = {
        idField: 'access_code',
        labelField: 'access_code_description',
        prismaModel: 'recreation_access_and_sub_access_code',
        middleware: vi.fn().mockReturnValue([
          {
            id: 'BOAT',
            label: 'Boat',
            children: [{ id: 'MOTOR', label: 'Motor' }],
          },
        ]),
        additionalFields: ['sub_access_code', 'sub_access_code_description'],
      };

      const mockResults = [
        {
          access_code: 'BOAT',
          access_code_description: 'Boat',
          sub_access_code: 'MOTOR',
          sub_access_code_description: 'Motor',
        },
      ];

      (prisma as any).recreation_access_and_sub_access_code = {
        findMany: vi.fn().mockResolvedValue(mockResults),
      };

      const result = await repository.findAllByType(mockAccessMapping);

      // Middleware receives (mapped: OptionDto[], raw: any[])
      expect(mockAccessMapping.middleware).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'BOAT', label: 'Boat' }),
        ]),
        mockResults,
      );
      expect(result).toEqual([
        {
          id: 'BOAT',
          label: 'Boat',
          children: [{ id: 'MOTOR', label: 'Motor' }],
        },
      ]);
    });

    it('should include is_archived for district options', async () => {
      const mockResults = [
        {
          district_code: 'D001',
          description: 'District 1',
          is_archived: false,
        },
        { district_code: 'D002', description: 'District 2', is_archived: true },
      ];

      (prisma as any).recreation_district_code.findMany.mockResolvedValue(
        mockResults,
      );

      const result = await repository.findAllByType(mockDistrictMapping);

      expect(result).toEqual([
        { id: 'D001', label: 'District 1', is_archived: false },
        { id: 'D002', label: 'District 2', is_archived: true },
      ]);
      expect(prisma.recreation_district_code.findMany).toHaveBeenCalledWith({
        select: {
          district_code: true,
          description: true,
          is_archived: true,
        },
        orderBy: { description: 'asc' },
      });
    });
  });

  describe('findAllByTypes', () => {
    it('should return a map of types to options using $transaction', async () => {
      const mockPairs = [
        {
          type: 'activities',
          mapping: mockTableMapping,
        },
      ];

      const activitiesRows = [
        { recreation_activity_code: 1, description: 'Hiking' },
      ];

      // $transaction should resolve with an array of results matching mapping pairs
      (prisma as any).$transaction.mockResolvedValue([activitiesRows]);

      const result = await repository.findAllByTypes(mockPairs as any);

      expect(result).toEqual({
        activities: [{ id: '1', label: 'Hiking' }],
      });
      expect((prisma as any).$transaction).toHaveBeenCalled();
    });

    it('should handle multiple mapping pairs and empty results', async () => {
      const mockPairs = [
        { type: 'activities', mapping: mockTableMapping },
        {
          type: 'recreationStatus',
          mapping: {
            idField: 'status_code',
            labelField: 'description',
            prismaModel: 'recreation_status_code',
          },
        },
      ];

      const activitiesRows = [
        { recreation_activity_code: 1, description: 'Hiking' },
      ];
      const statusRows: any[] = [];

      (prisma as any).$transaction.mockResolvedValue([
        activitiesRows,
        statusRows,
      ]);

      const result = await repository.findAllByTypes(mockPairs as any);

      expect(result).toEqual({
        activities: [{ id: '1', label: 'Hiking' }],
        recreationStatus: [],
      });
    });

    it('should apply middleware when provided', async () => {
      const middleware = vi.fn().mockReturnValue([
        {
          id: 'BOAT',
          label: 'Boat',
          children: [{ id: 'MOTOR', label: 'Motor' }],
        },
      ]);

      const mockPairs = [
        {
          type: 'access',
          mapping: {
            idField: 'access_code',
            labelField: 'access_code_description',
            prismaModel: 'recreation_access_and_sub_access_code',
            middleware,
            additionalFields: [
              'sub_access_code',
              'sub_access_code_description',
            ],
          },
        },
      ];

      const rows = [
        {
          access_code: 'BOAT',
          access_code_description: 'Boat',
          sub_access_code: 'MOTOR',
          sub_access_code_description: 'Motor',
        },
      ];

      (prisma as any).$transaction.mockResolvedValue([rows]);

      const result = await repository.findAllByTypes(mockPairs as any);

      expect(middleware).toHaveBeenCalled();
      expect(middleware).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'BOAT', label: 'Boat' }),
        ]),
        rows,
      );
      expect(result).toEqual({
        access: [
          {
            id: 'BOAT',
            label: 'Boat',
            children: [{ id: 'MOTOR', label: 'Motor' }],
          },
        ],
      });
    });

    it('should include is_archived for district options in findAllByTypes', async () => {
      const districtRows = [
        {
          district_code: 'D001',
          description: 'District 1',
          is_archived: false,
        },
        { district_code: 'D002', description: 'District 2', is_archived: true },
      ];

      (prisma as any).$transaction.mockResolvedValue([districtRows]);

      const result = await repository.findAllByTypes([
        { type: 'district', mapping: mockDistrictMapping },
      ] as any);

      expect(result).toEqual({
        district: [
          { id: 'D001', label: 'District 1', is_archived: false },
          { id: 'D002', label: 'District 2', is_archived: true },
        ],
      });
      expect((prisma as any).$transaction).toHaveBeenCalled();
    });
  });

  describe('findOneByTypeAndId', () => {
    it('should return a single option when found', async () => {
      const mockResult = { recreation_activity_code: 1, description: 'Hiking' };

      (prisma as any).recreation_activity_code.findUnique.mockResolvedValue(
        mockResult,
      );

      const result = await repository.findOneByTypeAndId(mockTableMapping, 1);

      expect(result).toEqual({ id: '1', label: 'Hiking' });
      expect(prisma.recreation_activity_code.findUnique).toHaveBeenCalledWith({
        where: { recreation_activity_code: 1 },
        select: {
          recreation_activity_code: true,
          description: true,
        },
      });
    });

    it('should include is_archived for district option when found', async () => {
      const mockResult = {
        district_code: 'D001',
        description: 'District 1',
        is_archived: false,
      };

      (prisma as any).recreation_district_code.findUnique.mockResolvedValue(
        mockResult,
      );

      const result = await repository.findOneByTypeAndId(
        mockDistrictMapping,
        'D001',
      );

      expect(result).toEqual({
        id: 'D001',
        label: 'District 1',
        is_archived: false,
      });
      expect(prisma.recreation_district_code.findUnique).toHaveBeenCalledWith({
        where: { district_code: 'D001' },
        select: {
          district_code: true,
          description: true,
          is_archived: true,
        },
      });
    });

    it('should return null when option not found', async () => {
      (prisma as any).recreation_activity_code.findUnique.mockResolvedValue(
        null,
      );

      const result = await repository.findOneByTypeAndId(mockTableMapping, 999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new option', async () => {
      const mockData = { description: 'Mountain Biking' };
      const mockResult = {
        recreation_activity_code: 3,
        description: 'Mountain Biking',
      };

      (prisma as any).recreation_activity_code.create.mockResolvedValue(
        mockResult,
      );

      const result = await repository.create(mockTableMapping, mockData);

      expect(result).toEqual({ id: '3', label: 'Mountain Biking' });
      expect(prisma.recreation_activity_code.create).toHaveBeenCalledWith({
        data: mockData,
        select: {
          recreation_activity_code: true,
          description: true,
        },
      });
    });

    it('should include is_archived when creating a district option', async () => {
      const mockData = { description: 'New District' };
      const mockResult = {
        district_code: 'D003',
        description: 'New District',
        is_archived: false,
      };

      (prisma as any).recreation_district_code.create.mockResolvedValue(
        mockResult,
      );

      const result = await repository.create(mockDistrictMapping, mockData);

      expect(result).toEqual({
        id: 'D003',
        label: 'New District',
        is_archived: false,
      });
      expect(prisma.recreation_district_code.create).toHaveBeenCalledWith({
        data: mockData,
        select: {
          district_code: true,
          description: true,
          is_archived: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update an existing option', async () => {
      const mockData = { description: 'Alpine Hiking' };
      const mockResult = {
        recreation_activity_code: 1,
        description: 'Alpine Hiking',
      };

      (prisma as any).recreation_activity_code.update.mockResolvedValue(
        mockResult,
      );

      const result = await repository.update(mockTableMapping, 1, mockData);

      expect(result).toEqual({ id: '1', label: 'Alpine Hiking' });
      expect(prisma.recreation_activity_code.update).toHaveBeenCalledWith({
        where: { recreation_activity_code: 1 },
        data: mockData,
        select: {
          recreation_activity_code: true,
          description: true,
        },
      });
    });

    it('should include is_archived when updating a district option', async () => {
      const mockData = { description: 'Updated District' };
      const mockResult = {
        district_code: 'D001',
        description: 'Updated District',
        is_archived: true,
      };

      (prisma as any).recreation_district_code.update.mockResolvedValue(
        mockResult,
      );

      const result = await repository.update(
        mockDistrictMapping,
        'D001',
        mockData,
      );

      expect(result).toEqual({
        id: 'D001',
        label: 'Updated District',
        is_archived: true,
      });
      expect(prisma.recreation_district_code.update).toHaveBeenCalledWith({
        where: { district_code: 'D001' },
        data: mockData,
        select: {
          district_code: true,
          description: true,
          is_archived: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete an option', async () => {
      (prisma as any).recreation_activity_code.delete.mockResolvedValue({});

      await repository.remove(mockTableMapping, 1);

      expect(prisma.recreation_activity_code.delete).toHaveBeenCalledWith({
        where: { recreation_activity_code: 1 },
      });
    });
  });

  describe('findAccessCode', () => {
    it('should find access code', async () => {
      const mockAccessCode = { access_code: 'road', description: 'Road' };

      (prisma as any).recreation_access_code.findUnique.mockResolvedValue(
        mockAccessCode,
      );

      const result = await repository.findAccessCode('road');

      expect(result).toEqual(mockAccessCode);
      expect(prisma.recreation_access_code.findUnique).toHaveBeenCalledWith({
        where: { access_code: 'road' },
      });
    });
  });

  describe('findSubAccessByAccessCode', () => {
    it.each([
      {
        name: 'with descriptions',
        mockResults: [
          { sub_access_code: 'paved', description: 'Paved' },
          { sub_access_code: 'gravel', description: 'Gravel' },
        ],
        expected: [
          { id: 'paved', label: 'Paved' },
          { id: 'gravel', label: 'Gravel' },
        ],
      },
      {
        name: 'with missing descriptions',
        mockResults: [
          { sub_access_code: 'paved', description: null },
          { sub_access_code: 'gravel' },
        ],
        expected: [
          { id: 'paved', label: '' },
          { id: 'gravel', label: '' },
        ],
      },
    ])(
      'should find sub-access codes $name',
      async ({ mockResults, expected }) => {
        (prisma as any).recreation_sub_access_code.findMany.mockResolvedValue(
          mockResults,
        );

        const result = await repository.findSubAccessByAccessCode('road');

        expect(result).toEqual(expected);
        expect(prisma.recreation_sub_access_code.findMany).toHaveBeenCalledWith(
          {
            where: {
              recreation_access: {
                some: { access_code: 'road' },
              },
            },
            select: {
              sub_access_code: true,
              description: true,
            },
            orderBy: { description: 'asc' },
          },
        );
      },
    );
  });

  describe('findSubAccessCode', () => {
    it('should find sub-access code', async () => {
      const mockSubAccessCode = {
        sub_access_code: 'paved',
        description: 'Paved',
      };

      (prisma as any).recreation_sub_access_code.findUnique.mockResolvedValue(
        mockSubAccessCode,
      );

      const result = await repository.findSubAccessCode('paved');

      expect(result).toEqual(mockSubAccessCode);
      expect(prisma.recreation_sub_access_code.findUnique).toHaveBeenCalledWith(
        {
          where: { sub_access_code: 'paved' },
        },
      );
    });

    it('should return null when sub-access code not found', async () => {
      (prisma as any).recreation_sub_access_code.findUnique.mockResolvedValue(
        null,
      );

      const result = await repository.findSubAccessCode('missing');

      expect(result).toBeNull();
    });
  });

  describe('findAccessSubAccessCombination', () => {
    it.each([
      {
        name: 'when found',
        mockResult: { access_code: 'road', sub_access_code: 'paved' },
        expected: { access_code: 'road', sub_access_code: 'paved' },
      },
      {
        name: 'when not found',
        mockResult: null,
        expected: null,
      },
    ])('should $name', async ({ mockResult, expected }) => {
      (prisma as any).recreation_access.findFirst.mockResolvedValue(mockResult);

      const result = await repository.findAccessSubAccessCombination(
        'road',
        'paved',
      );

      expect(result).toEqual(expected);
      if (mockResult) {
        expect(prisma.recreation_access.findFirst).toHaveBeenCalledWith({
          where: {
            access_code: 'road',
            sub_access_code: 'paved',
          },
        });
      }
    });
  });

  describe('createSubAccess', () => {
    it.each([
      {
        name: 'with description',
        code: 'dirt',
        description: 'Dirt Road',
        mockResult: { sub_access_code: 'dirt', description: 'Dirt Road' },
        expected: { id: 'dirt', label: 'Dirt Road' },
      },
      {
        name: 'without description',
        code: 'dirt',
        description: undefined,
        mockResult: { sub_access_code: 'dirt' },
        expected: { id: 'dirt', label: '' },
      },
    ])(
      'should create sub-access code $name',
      async ({ code, description, mockResult, expected }) => {
        (prisma as any).recreation_sub_access_code.create.mockResolvedValue(
          mockResult,
        );

        const result = await repository.createSubAccess(
          code,
          description as any,
        );

        expect(result).toEqual(expected);
      },
    );
  });

  describe('updateSubAccess', () => {
    it.each([
      {
        name: 'with description',
        code: 'paved',
        description: 'Paved Highway',
        mockResult: { sub_access_code: 'paved', description: 'Paved Highway' },
        expected: { id: 'paved', label: 'Paved Highway' },
      },
      {
        name: 'without description',
        code: 'paved',
        description: undefined,
        mockResult: { sub_access_code: 'paved' },
        expected: { id: 'paved', label: '' },
      },
    ])(
      'should update sub-access code $name',
      async ({ code, description, mockResult, expected }) => {
        (prisma as any).recreation_sub_access_code.update.mockResolvedValue(
          mockResult,
        );

        const result = await repository.updateSubAccess(
          code,
          description as any,
        );

        expect(result).toEqual(expected);
      },
    );
  });

  describe('removeSubAccess', () => {
    it('should delete sub-access code', async () => {
      (prisma as any).recreation_sub_access_code.delete.mockResolvedValue({});

      await repository.removeSubAccess('paved');

      expect(prisma.recreation_sub_access_code.delete).toHaveBeenCalledWith({
        where: { sub_access_code: 'paved' },
      });
    });
  });
});
