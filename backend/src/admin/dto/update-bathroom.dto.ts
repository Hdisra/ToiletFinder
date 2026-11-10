import {
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { BathroomCategory } from '../../bathrooms/bathroom.entity.js';
import { Trim } from '../../common/trim.decorator.js';

/** Every field is optional: only the ones sent are changed. */
export class UpdateBathroomDto {
  @Trim()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  /** `null` or an empty text removes the address. */
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string | null;

  @IsOptional()
  @IsEnum(BathroomCategory)
  category?: BathroomCategory;

  @IsOptional()
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999)
  price?: number;
}
