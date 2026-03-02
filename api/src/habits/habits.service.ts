import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncRequestDto, SyncChangeDto } from './dto/sync-habits.dto';

@Injectable()
export class HabitsService {
  private readonly logger = new Logger(HabitsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Process a batch of sync changes from a device.
   * Uses last-write-wins conflict resolution based on updatedAt timestamps.
   */
  async syncBatch(dto: SyncRequestDto) {
    const { deviceId, changes } = dto;
    let resolvedConflicts = 0;

    for (const change of changes) {
      try {
        switch (change.action) {
          case 'create':
            await this.handleCreate(change, deviceId);
            break;
          case 'update':
          case 'toggle':
            const hadConflict = await this.handleUpdate(change, deviceId);
            if (hadConflict) resolvedConflicts++;
            break;
          case 'delete':
            await this.handleDelete(change);
            break;
        }
      } catch (error) {
        this.logger.error(
          `Failed to process change ${change.id}: ${error.message}`,
        );
      }
    }

    // Return all habits for this device so the client can reconcile
    const habits = await this.prisma.habit.findMany({
      where: { deviceId },
    });

    return {
      habits: habits.map((h) => ({
        ...h,
        completedDates: JSON.parse(h.completedDates),
        createdAt: h.createdAt.toISOString(),
        updatedAt: h.updatedAt.toISOString(),
      })),
      resolvedConflicts,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Create a habit if it doesn't already exist.
   */
  private async handleCreate(change: SyncChangeDto, deviceId: string) {
    const existing = await this.prisma.habit.findUnique({
      where: { id: change.habitId },
    });

    if (existing) {
      this.logger.log(
        `Habit ${change.habitId} already exists, skipping create`,
      );
      return;
    }

    const payload = change.payload;
    await this.prisma.habit.create({
      data: {
        id: change.habitId,
        deviceId,
        name: payload.name || 'Untitled Habit',
        description: payload.description || null,
        frequency: payload.frequency || 'daily',
        completedDates: JSON.stringify(payload.completedDates || []),
        createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
        isArchived: payload.isArchived ?? false,
      },
    });
  }

  /**
   * Update a habit with last-write-wins conflict resolution.
   * Compares the incoming updatedAt with the server's updatedAt.
   */
  private async handleUpdate(
    change: SyncChangeDto,
    deviceId: string,
  ): Promise<boolean> {
    const existing = await this.prisma.habit.findUnique({
      where: { id: change.habitId },
    });

    if (!existing) {
      // Habit doesn't exist on server — treat as create
      await this.handleCreate(change, deviceId);
      return false;
    }

    const incomingTime = new Date(change.timestamp).getTime();
    const serverTime = existing.updatedAt.getTime();

    // Last-write-wins: only apply if the incoming change is newer
    if (incomingTime <= serverTime) {
      this.logger.log(
        `Conflict on habit ${change.habitId}: server is newer, skipping`,
      );
      return true; // conflict detected but server wins
    }

    const payload = change.payload;
    const updateData: Record<string, any> = {};

    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined)
      updateData.description = payload.description;
    if (payload.frequency !== undefined)
      updateData.frequency = payload.frequency;
    if (payload.completedDates !== undefined)
      updateData.completedDates = JSON.stringify(payload.completedDates);
    if (payload.isArchived !== undefined)
      updateData.isArchived = payload.isArchived;

    if (Object.keys(updateData).length > 0) {
      await this.prisma.habit.update({
        where: { id: change.habitId },
        data: updateData,
      });
    }

    return false;
  }

  /**
   * Soft-delete a habit by setting isArchived = true.
   */
  private async handleDelete(change: SyncChangeDto) {
    const existing = await this.prisma.habit.findUnique({
      where: { id: change.habitId },
    });

    if (!existing) return;

    await this.prisma.habit.update({
      where: { id: change.habitId },
      data: { isArchived: true },
    });
  }

  /**
   * Get all habits for a device.
   */
  async getHabitsByDevice(deviceId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { deviceId },
    });

    return habits.map((h) => ({
      ...h,
      completedDates: JSON.parse(h.completedDates),
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
    }));
  }
}
