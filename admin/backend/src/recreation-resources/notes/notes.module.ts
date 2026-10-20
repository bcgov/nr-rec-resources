import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotesController],
  providers: [NotesService, PrismaService],
  exports: [NotesService],
})
export class NotesModule {}
