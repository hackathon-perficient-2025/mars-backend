import { Schema, model, Document } from 'mongoose';

export interface RoverPosition {
    latitude: number;
    longitude: number;
}

export interface RoverWheels {
    fl: number;
    fr: number;
    ml: number;
    mr: number;
    rl: number;
    rr: number;
}

export interface IRover extends Document {
    id: string;
    name: string;
    batteryLevel: number;
    speed: number;
    temperature: number;
    status: 'active' | 'idle' | 'error' | 'maintenance';
    coordinates: RoverPosition;
    lastCommunication: Date;
    cameraStatus: 'online' | 'offline' | 'error';
    drillStatus: 'stowed' | 'deployed' | 'error';
    wheels: RoverWheels;
    createdAt: Date;
    updatedAt: Date;
}

const RoverPositionSchema = new Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
}, { _id: false });

const RoverWheelsSchema = new Schema({
    fl: { type: Number, required: true, min: 0, max: 100 },
    fr: { type: Number, required: true, min: 0, max: 100 },
    ml: { type: Number, required: true, min: 0, max: 100 },
    mr: { type: Number, required: true, min: 0, max: 100 },
    rl: { type: Number, required: true, min: 0, max: 100 },
    rr: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false });

const RoverSchema = new Schema<IRover>(
    {
        id: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        batteryLevel: { type: Number, required: true, min: 0, max: 100 },
        speed: { type: Number, required: true, min: 0 },
        temperature: { type: Number, required: true },
        status: {
            type: String,
            required: true,
            enum: ['active', 'idle', 'error', 'maintenance'],
        },
        coordinates: { type: RoverPositionSchema, required: true },
        lastCommunication: { type: Date, required: true },
        cameraStatus: {
            type: String,
            required: true,
            enum: ['online', 'offline', 'error'],
        },
        drillStatus: {
            type: String,
            required: true,
            enum: ['stowed', 'deployed', 'error'],
        },
        wheels: { type: RoverWheelsSchema, required: true },
    },
    {
        timestamps: true,
    }
);

export const Rover = model<IRover>('Rover', RoverSchema);
