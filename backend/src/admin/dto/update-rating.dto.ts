import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Trim } from '../../common/trim.decorator.js';

export class UpdateRatingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  score?: number;

  /** `null` or an empty text removes the comment. */
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string | null;
}
