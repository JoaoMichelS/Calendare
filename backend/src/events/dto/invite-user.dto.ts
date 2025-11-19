import { IsArray, ArrayMinSize, IsBoolean, IsOptional, IsEmail } from 'class-validator';

export class InviteUserDto {
  @IsArray()
  @IsEmail({}, { each: true, message: 'Emails devem ser válidos' })
  @ArrayMinSize(1, { message: 'Deve convidar pelo menos um usuário' })
  emails: string[];

  @IsOptional()
  @IsBoolean({ message: 'canEdit deve ser um valor booleano' })
  canEdit?: boolean;
}
