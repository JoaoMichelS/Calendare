import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventEditGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const eventId = parseInt(request.params.id);

    if (!userId) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!eventId || isNaN(eventId)) {
      throw new ForbiddenException('ID de evento inválido');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
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

    return true;
  }
}
