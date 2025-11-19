import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { RespondToInviteDto } from './dto/respond-invite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { EventOwnerGuard } from './guards/event-owner.guard';
import { EventAccessGuard } from './guards/event-access.guard';
import { EventEditGuard } from './guards/event-edit.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@CurrentUser() user: UserEntity, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(user.id, createEventDto);
  }

  @Get()
  findAll(@CurrentUser() user: UserEntity, @Query() filters: EventFilterDto) {
    return this.eventsService.findAll(user.id, filters);
  }

  @Get(':id')
  @UseGuards(EventAccessGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserEntity) {
    return this.eventsService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(EventEditGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, user.id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(EventOwnerGuard)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserEntity) {
    return this.eventsService.remove(id, user.id);
  }

  @Post(':id/invite')
  @UseGuards(EventOwnerGuard)
  inviteUsers(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() inviteUserDto: InviteUserDto,
  ) {
    return this.eventsService.inviteUsers(id, user.id, inviteUserDto);
  }

  @Delete(':id/invite/:userId')
  @UseGuards(EventOwnerGuard)
  removeInvite(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.eventsService.removeInvite(id, user.id, userId);
  }

  @Patch(':id/invite/respond')
  @UseGuards(EventAccessGuard)
  respondToInvite(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() respondDto: RespondToInviteDto,
  ) {
    return this.eventsService.respondToInvite(id, user.id, respondDto);
  }

  @Get('invites/pending')
  getPendingInvites(@CurrentUser() user: UserEntity) {
    return this.eventsService.getPendingInvites(user.id);
  }

  @Get(':id/invites')
  @UseGuards(EventOwnerGuard)
  getEventInvites(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserEntity) {
    return this.eventsService.getEventInvites(id, user.id);
  }
}
