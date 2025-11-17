import { IsDateString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class EventFilterDto {
  @IsDateString({}, { message: 'Data de início inválida' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'Data de fim inválida' })
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  userId?: number;
}
