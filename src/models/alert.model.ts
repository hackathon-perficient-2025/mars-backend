import mongoose, { Schema, Document } from 'mongoose';
import type { AlertLevel } from '../types/alert.types';

export interface IAlert extends Document {
  id: string;
  resourceId: string;
  resourceName: string;
  level: AlertLevel;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    resourceId: {
      type: String,
      required: true,
      index: true,
    },
    resourceName: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
      enum: ['critical', 'warning', 'info'],
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    acknowledged: {
      type: Boolean,
      default: false,
      index: true,
    },
    acknowledgedBy: {
      type: String,
    },
    acknowledgedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

AlertSchema.index({ acknowledged: 1, timestamp: -1 });
AlertSchema.index({ resourceId: 1, acknowledged: 1 });
AlertSchema.index({ level: 1, acknowledged: 1 });

export const AlertModel = mongoose.model<IAlert>('Alert', AlertSchema);
