import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class FindNearbyDto {
  @Type(() => Number)
  @IsLatitude()
  lat: number;

  @Type(() => Number)
  @IsLongitude()
  lng: number;

  /** Search radius in meters. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50000)
  radius: number = 2000;

  /** When true, bathrooms that cost money are included. */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includePaid: boolean = false;
}
