import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class StatsQueryDto {
  /** The admin's UTC offset in minutes (e.g. -360 for UTC-6), to group ratings by their local day. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-840)
  @Max(840)
  tzOffset: number = 0;
}
