import { IsInt, IsArray, ArrayMinSize } from 'class-validator';

export class InviteUserDto {
  @IsArray()
  @IsInt({ each: true, message: 'IDs de usuários devem ser números' })
  @ArrayMinSize(1, { message: 'Deve convidar pelo menos um usuário' })
  userIds: number[];
}
