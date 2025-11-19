import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventOwnerGuard } from './guards/event-owner.guard';
import { EventAccessGuard } from './guards/event-access.guard';
import { EventEditGuard } from './guards/event-edit.guard';

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventOwnerGuard, EventAccessGuard, EventEditGuard],
  exports: [EventsService],
})
export class EventsModule {}
