import {
  IsString,
  IsArray,
  IsOptional,
  IsObject,
  ValidateNested,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SyncChangeDto {
  @IsString()
  id: string;

  @IsString()
  habitId: string;

  @IsIn(['create', 'update', 'toggle', 'delete'])
  action: 'create' | 'update' | 'toggle' | 'delete';

  @IsObject()
  payload: Record<string, any>;

  @IsString()
  timestamp: string;

  @IsIn(['pending', 'synced', 'failed'])
  status: string;
}

export class SyncRequestDto {
  @IsString()
  deviceId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncChangeDto)
  changes: SyncChangeDto[];

  @IsOptional()
  @IsString()
  lastSyncedAt?: string;
}

export class CreateHabitDto {
  @IsString()
  id: string;

  @IsString()
  deviceId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['daily', 'weekly'])
  frequency?: string;

  @IsOptional()
  @IsArray()
  completedDates?: string[];

  @IsOptional()
  @IsString()
  createdAt?: string;

  @IsOptional()
  @IsString()
  updatedAt?: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
