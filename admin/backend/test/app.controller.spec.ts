import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppController } from "../src/app.controller";
import { AppService } from "../src/app.service";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: vi.fn().mockReturnValue("Hello World!"),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe("getHello", () => {
    it("should return the result of appService.getHello", () => {
      expect(appController.getHello()).toBe("Hello World!");
      expect(appService.getHello).toHaveBeenCalled();
    });
  });
});
