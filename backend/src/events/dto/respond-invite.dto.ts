import { IsEnum, IsIn } from 'class-validator';

export class RespondToInviteDto {
  @IsIn(['ACCEPTED', 'DECLINED'], { message: 'Status deve ser ACCEPTED ou DECLINED' })
  status: 'ACCEPTED' | 'DECLINED';
}
