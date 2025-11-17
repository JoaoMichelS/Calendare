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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

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
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserEntity) {
    return this.eventsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, user.id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserEntity) {
    return this.eventsService.remove(id, user.id);
  }

  @Post(':id/invite')
  inviteUsers(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() inviteUserDto: InviteUserDto,
  ) {
    return this.eventsService.inviteUsers(id, user.id, inviteUserDto);
  }

  @Delete(':id/invite/:userId')
  removeInvite(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.eventsService.removeInvite(id, user.id, userId);
  }
}
