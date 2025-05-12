import { Injectable } from '@nestjs/common';
import * as Prisma from "../../../prisma-client/dist";

@Injectable()
export class TestService {
  async getLocation(): Promise<any> {
    const { prisma } = await Prisma.createContext();
    return await prisma.recreation_resource.findUnique({
      where: {
        rec_resource_id: 'REC204117',
        AND: {
          display_on_public_site: true,
        },
      },
    });
  }
}
