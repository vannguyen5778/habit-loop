import { Controller, Post, Get, Body, Query, Logger } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { SyncRequestDto } from './dto/sync-habits.dto';

@Controller('habits')
export class HabitsController {
  private readonly logger = new Logger(HabitsController.name);

  constructor(private readonly habitsService: HabitsService) {}

  /**
   * POST /habits/sync
   * Accepts a batch of local changes for sync.
   * Returns the server's canonical habit list for reconciliation.
   */
  @Post('sync')
  async sync(@Body() syncRequest: SyncRequestDto) {
    this.logger.log(
      `Sync request from device ${syncRequest.deviceId} with ${syncRequest.changes.length} changes`,
    );
    return this.habitsService.syncBatch(syncRequest);
  }

  /**
   * GET /habits?deviceId=xxx
   * Returns all habits for a device (for initial load / full sync).
   */
  @Get()
  async getHabits(@Query('deviceId') deviceId: string) {
    return this.habitsService.getHabitsByDevice(deviceId);
  }

  /**
   * GET /habits/health
   * Simple health check endpoint.
   */
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
