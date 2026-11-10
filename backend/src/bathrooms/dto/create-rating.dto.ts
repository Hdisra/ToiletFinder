import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Trim } from '../../common/trim.decorator.js';

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(10)
  score: number;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
