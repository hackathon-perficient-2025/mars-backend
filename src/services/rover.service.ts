import type { RoverRepository, CreateRoverDto, UpdateRoverDto } from '../repositories/rover.repository';
import type { IRover } from '../models/rover.model';

export class RoverService {
    constructor(private roverRepository: RoverRepository) { }

    async getAllRovers(): Promise<IRover[]> {
        return await this.roverRepository.findAll();
    }

    async getRoverById(id: string): Promise<IRover> {
        const rover = await this.roverRepository.findById(id);
        if (!rover) {
            throw new Error(`Rover with id ${id} not found`);
        }
        return rover;
    }

    async createRover(dto: CreateRoverDto): Promise<IRover> {
        return await this.roverRepository.create(dto);
    }

    async updateRover(id: string, dto: UpdateRoverDto): Promise<IRover> {
        const updated = await this.roverRepository.update(id, dto);
        if (!updated) {
            throw new Error(`Rover with id ${id} not found`);
        }
        return updated;
    }

    async deleteRover(id: string): Promise<void> {
        const deleted = await this.roverRepository.delete(id);
        if (!deleted) {
            throw new Error(`Rover with id ${id} not found`);
        }
    }

    async simulateRoverUpdates(): Promise<void> {
        const rovers = await this.roverRepository.findAll();

        const updatePromises = rovers.map(async (rover) => {
            // Different simulation logic based on status
            if (rover.status === 'error') {
                // Critical rover gets worse
                const newBattery = Math.max(0, rover.batteryLevel - 0.05);
                const newTemp = Math.min(120, rover.temperature + (Math.random() * 0.5));

                await this.roverRepository.update(rover.id, {
                    batteryLevel: Number(newBattery.toFixed(2)),
                    temperature: Number(newTemp.toFixed(1)),
                    speed: 0,
                });
            } else if (rover.status === 'active') {
                // Healthy rover simulation
                const speedChange = Math.random() > 0.7 ? (Math.random() - 0.5) * 0.5 : 0;
                const newSpeed = Math.max(0, Math.min(5, rover.speed + speedChange));

                const tempChange = (Math.random() - 0.5) * 0.3;
                const batteryDrain = rover.speed > 0 ? 0.015 : 0.002;

                const newBattery = Math.max(0, rover.batteryLevel - batteryDrain);
                const newTemp = rover.temperature + tempChange;

                // Small coordinate changes if moving
                let newCoordinates = rover.coordinates;
                if (newSpeed > 0) {
                    newCoordinates = {
                        latitude: rover.coordinates.latitude + (Math.random() - 0.5) * 0.0001,
                        longitude: rover.coordinates.longitude + (Math.random() - 0.5) * 0.0001,
                    };
                }

                await this.roverRepository.update(rover.id, {
                    speed: Number(newSpeed.toFixed(2)),
                    batteryLevel: Number(newBattery.toFixed(2)),
                    temperature: Number(newTemp.toFixed(1)),
                    coordinates: newCoordinates,
                });
            }
        });

        await Promise.all(updatePromises);
    }

    getRoverStatus(rover: IRover): 'critical' | 'warning' | 'normal' | 'optimal' {
        if (rover.status === 'error') return 'critical';
        if (rover.batteryLevel < 15) return 'critical';
        if (rover.batteryLevel < 30 || rover.temperature > 70) return 'warning';
        if (rover.batteryLevel > 80 && rover.temperature < 30) return 'optimal';
        return 'normal';
    }
}
