import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { RespondToInviteDto } from './dto/respond-invite.dto';
import { InviteStatus } from '@prisma/client';
import { RRule } from 'rrule';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createEventDto: CreateEventDto) {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      color,
      isRecurring,
      recurrenceRule,
      recurrenceEndDate,
      reminders,
    } = createEventDto;

    // Validar datas
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException('Data de início deve ser anterior à data de fim');
    }

    // Criar evento
    const event = await this.prisma.event.create({
      data: {
        title,
        description,
        startDate: start,
        endDate: end,
        location,
        color: color || '#3788d8',
        isRecurring: isRecurring || false,
        recurrenceRule,
        recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
        reminders: reminders || [],
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        invites: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return event;
  }

  async findAll(userId: number, filters?: EventFilterDto) {
    const where: any = {
      OR: [
        { userId }, // Eventos criados pelo usuário
        {
          invites: {
            some: {
              userId,
            },
          },
        }, // Eventos onde o usuário foi convidado
      ],
    };

    if (filters?.startDate || filters?.endDate) {
      where.AND = [];

      if (filters.startDate) {
        where.AND.push({
          endDate: {
            gte: new Date(filters.startDate),
          },
        });
      }

      if (filters.endDate) {
        where.AND.push({
          startDate: {
            lte: new Date(filters.endDate),
          },
        });
      }
    }

    const events = await this.prisma.event.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        invites: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    // Expandir eventos recorrentes se houver filtro de data
    if (filters?.startDate && filters?.endDate) {
      return this.expandRecurringEvents(events, new Date(filters.startDate), new Date(filters.endDate));
    }

    return events;
  }

  async findOne(id: number, userId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        invites: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    // Verificar se o usuário tem acesso ao evento
    const hasAccess =
      event.userId === userId ||
      event.invites.some((invite) => invite.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('Você não tem permissão para acessar este evento');
    }

    return event;
  }

  async update(id: number, userId: number, updateEventDto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        invites: {
          where: { userId },
          select: { canEdit: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    const isOwner = event.userId === userId;
    const canEdit = event.invites.length > 0 && event.invites[0].canEdit;

    if (!isOwner && !canEdit) {
      throw new ForbiddenException('Você não tem permissão para editar este evento');
    }

    const updateData: any = {};

    if (updateEventDto.title !== undefined) updateData.title = updateEventDto.title;
    if (updateEventDto.description !== undefined) updateData.description = updateEventDto.description;
    if (updateEventDto.location !== undefined) updateData.location = updateEventDto.location;
    if (updateEventDto.color !== undefined) updateData.color = updateEventDto.color;
    if (updateEventDto.isRecurring !== undefined) updateData.isRecurring = updateEventDto.isRecurring;
    if (updateEventDto.recurrenceRule !== undefined) updateData.recurrenceRule = updateEventDto.recurrenceRule;
    if (updateEventDto.reminders !== undefined) updateData.reminders = updateEventDto.reminders;

    if (updateEventDto.startDate !== undefined) {
      updateData.startDate = new Date(updateEventDto.startDate);
    }
    if (updateEventDto.endDate !== undefined) {
      updateData.endDate = new Date(updateEventDto.endDate);
    }
    if (updateEventDto.recurrenceEndDate !== undefined) {
      updateData.recurrenceEndDate = updateEventDto.recurrenceEndDate ? new Date(updateEventDto.recurrenceEndDate) : null;
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        invites: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return updatedEvent;
  }

  async remove(id: number, userId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para deletar este evento');
    }

    await this.prisma.event.delete({
      where: { id },
    });
  }

  async inviteUsers(eventId: number, userId: number, inviteUserDto: InviteUserDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('Apenas o criador do evento pode convidar usuários');
    }

    const canEdit = inviteUserDto.canEdit || false;

    // Validar que os usuários existem (buscar por email)
    const users = await this.prisma.user.findMany({
      where: {
        email: {
          in: inviteUserDto.emails,
        },
      },
      select: { id: true, email: true },
    });

    const foundEmails = users.map((u) => u.email);
    const missingEmails = inviteUserDto.emails.filter((email) => !foundEmails.includes(email));

    if (missingEmails.length > 0) {
      throw new BadRequestException(`Usuários não encontrados: ${missingEmails.join(', ')}`);
    }

    // Criar convites em lote
    const invites = await Promise.all(
      users.map((user) =>
        this.prisma.eventInvite.upsert({
          where: {
            eventId_userId: {
              eventId,
              userId: user.id,
            },
          },
          create: {
            eventId,
            userId: user.id,
            canEdit,
            status: InviteStatus.PENDING,
          },
          update: {
            canEdit,
            status: InviteStatus.PENDING,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        })
      )
    );

    return invites;
  }

  async removeInvite(eventId: number, userId: number, invitedUserId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('Apenas o criador do evento pode remover convites');
    }

    await this.prisma.eventInvite.delete({
      where: {
        eventId_userId: {
          eventId,
          userId: invitedUserId,
        },
      },
    });
  }

  async respondToInvite(eventId: number, userId: number, respondDto: RespondToInviteDto) {
    // Verificar se o convite existe
    const invite = await this.prisma.eventInvite.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }

    // Atualizar status do convite
    const updatedInvite = await this.prisma.eventInvite.update({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      data: {
        status: respondDto.status,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return updatedInvite;
  }

  async getPendingInvites(userId: number) {
    const invites = await this.prisma.eventInvite.findMany({
      where: {
        userId,
        status: InviteStatus.PENDING,
      },
      include: {
        event: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invites;
  }

  async getEventInvites(eventId: number, userId: number) {
    // Verificar se o usuário é o criador do evento
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('Apenas o criador do evento pode visualizar a lista de convites');
    }

    // Buscar todos os convites do evento
    const invites = await this.prisma.eventInvite.findMany({
      where: {
        eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invites;
  }

  // Método auxiliar para expandir eventos recorrentes
  private expandRecurringEvents(events: any[], startDate: Date, endDate: Date) {
    const expandedEvents = [];

    for (const event of events) {
      if (!event.isRecurring || !event.recurrenceRule) {
        // Evento não recorrente, adicionar diretamente
        expandedEvents.push(event);
      } else {
        // Evento recorrente, gerar ocorrências
        try {
          const rule = RRule.fromString(event.recurrenceRule);
          const occurrences = rule.between(startDate, endDate, true);

          const eventDuration = event.endDate.getTime() - event.startDate.getTime();

          occurrences.forEach((occurrence) => {
            const occurrenceEnd = new Date(occurrence.getTime() + eventDuration);

            expandedEvents.push({
              ...event,
              startDate: occurrence,
              endDate: occurrenceEnd,
              isRecurringInstance: true,
              originalEventId: event.id,
            });
          });
        } catch (error) {
          // Se houver erro ao processar a regra, adicionar o evento original
          expandedEvents.push(event);
        }
      }
    }

    return expandedEvents;
  }
}
