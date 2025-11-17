import {
  IsString,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  IsHexColor,
} from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Data de início inválida' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'Data de fim inválida' })
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsHexColor({ message: 'Cor deve ser um código hexadecimal válido' })
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsOptional()
  recurrenceRule?: string;

  @IsDateString({}, { message: 'Data de fim da recorrência inválida' })
  @IsOptional()
  recurrenceEndDate?: string;

  @IsArray()
  @IsNumber({}, { each: true, message: 'Lembretes devem ser números (minutos)' })
  @IsOptional()
  reminders?: number[];
}
