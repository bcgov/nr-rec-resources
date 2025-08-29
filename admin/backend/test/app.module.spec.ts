import { AppController } from '@/app.controller';
import { AppModule } from '@/app.module';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have ConfigModule configured globally', () => {
    const configModule = module.get(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it('should have PassportModule imported', () => {
    const passportModule = module.get(PassportModule);
    expect(passportModule).toBeDefined();
  });

  it('should have AuthModule imported', () => {
    const authModule = module.get(AuthModule);
    expect(authModule).toBeDefined();
  });

  it('should have AppController registered', () => {
    const appController = module.get(AppController);
    expect(appController).toBeDefined();
    expect(appController).toBeInstanceOf(AppController);
  });

  it('should have AppService registered', () => {
    const appService = module.get(AppService);
    expect(appService).toBeDefined();
    expect(appService).toBeInstanceOf(AppService);
  });

  describe('Module configuration', () => {
    it('should have correct module metadata', () => {
      const moduleFixture = AppModule;
      const metadata = Reflect.getMetadata('imports', moduleFixture);

      expect(metadata).toHaveLength(8);
      expect(metadata).toEqual(
        expect.arrayContaining([
          PassportModule,
          AuthModule,
          expect.any(Function), // ClsModule.forRoot() returns a DynamicModule
          expect.any(Object), // AppConfigModule
          expect.any(Object), // UserContextModule
          expect.any(Object), // TerminusModule
          expect.any(Object), // RecreationResourceModule
          expect.any(Object), // ApiMetricsModule
        ]),
      );
    });
  });
});
