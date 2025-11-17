import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  IsHexColor,
  ValidateIf,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Título é obrigatório' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Data de início inválida' })
  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  startDate: string;

  @IsDateString({}, { message: 'Data de fim inválida' })
  @IsNotEmpty({ message: 'Data de fim é obrigatória' })
  endDate: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsHexColor({ message: 'Cor deve ser um código hexadecimal válido' })
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ValidateIf((o) => o.isRecurring === true)
  @IsString()
  @IsNotEmpty({ message: 'Regra de recorrência é obrigatória quando o evento é recorrente' })
  recurrenceRule?: string;

  @ValidateIf((o) => o.isRecurring === true)
  @IsDateString({}, { message: 'Data de fim da recorrência inválida' })
  @IsOptional()
  recurrenceEndDate?: string;

  @IsArray()
  @IsNumber({}, { each: true, message: 'Lembretes devem ser números (minutos)' })
  @IsOptional()
  reminders?: number[];
}
