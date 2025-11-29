import type { IRover } from '../models/rover.model';
import { Rover } from '../models/rover.model';

export interface CreateRoverDto {
    name: string;
    batteryLevel?: number;
    speed?: number;
    temperature?: number;
    status?: 'active' | 'idle' | 'error' | 'maintenance';
    coordinates: {
        latitude: number;
        longitude: number;
    };
    cameraStatus?: 'online' | 'offline' | 'error';
    drillStatus?: 'stowed' | 'deployed' | 'error';
    wheels?: {
        fl: number;
        fr: number;
        ml: number;
        mr: number;
        rl: number;
        rr: number;
    };
}

export interface UpdateRoverDto {
    name?: string;
    batteryLevel?: number;
    speed?: number;
    temperature?: number;
    status?: 'active' | 'idle' | 'error' | 'maintenance';
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    lastCommunication?: Date;
    cameraStatus?: 'online' | 'offline' | 'error';
    drillStatus?: 'stowed' | 'deployed' | 'error';
    wheels?: {
        fl: number;
        fr: number;
        ml: number;
        mr: number;
        rl: number;
        rr: number;
    };
}

export class RoverRepository {
    async findAll(): Promise<IRover[]> {
        return await Rover.find().lean();
    }

    async findById(id: string): Promise<IRover | null> {
        return await Rover.findOne({ id }).lean();
    }

    async create(dto: CreateRoverDto): Promise<IRover> {
        const rover = new Rover({
            id: `rover-${Date.now()}`,
            name: dto.name,
            batteryLevel: dto.batteryLevel ?? 100,
            speed: dto.speed ?? 0,
            temperature: dto.temperature ?? -20,
            status: dto.status ?? 'active',
            coordinates: dto.coordinates,
            lastCommunication: new Date(),
            cameraStatus: dto.cameraStatus ?? 'online',
            drillStatus: dto.drillStatus ?? 'stowed',
            wheels: dto.wheels ?? { fl: 100, fr: 100, ml: 100, mr: 100, rl: 100, rr: 100 },
        });

        return await rover.save();
    }

    async update(id: string, dto: UpdateRoverDto): Promise<IRover | null> {
        return await Rover.findOneAndUpdate(
            { id },
            { ...dto, lastCommunication: new Date() },
            { new: true }
        ).lean();
    }

    async delete(id: string): Promise<boolean> {
        const result = await Rover.deleteOne({ id });
        return result.deletedCount > 0;
    }
}
