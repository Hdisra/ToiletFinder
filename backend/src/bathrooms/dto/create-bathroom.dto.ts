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
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../common/trim.decorator.js';
import { BathroomCategory } from '../bathroom.entity.js';

export class CreateBathroomDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsEnum(BathroomCategory)
  category?: BathroomCategory;

  @IsNumber() // a number, not a text that looks like one
  @IsLatitude()
  latitude: number;

  @IsNumber()
  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ValidateIf((dto: CreateBathroomDto) => dto.isFree === false)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999)
  price?: number;
}
