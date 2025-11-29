import mongoose, { Schema, Document } from 'mongoose';
import type { ResourceType } from '../types/resource.types';
import type { ResupplyPriority, ResupplyStatus } from '../types/resupply.types';

export interface IResupplyRequest extends Document {
  id: string;
  resourceType: ResourceType;
  quantity: number;
  priority: ResupplyPriority;
  status: ResupplyStatus;
  requestedBy: string;
  requestedAt: Date;
  notes?: string;
  estimatedDelivery?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResupplyRequestSchema = new Schema<IResupplyRequest>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      enum: ['oxygen', 'water', 'spare_parts', 'food'],
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    priority: {
      type: String,
      required: true,
      enum: ['urgent', 'high', 'normal'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'in_transit', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    requestedBy: {
      type: String,
      required: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
    },
    estimatedDelivery: {
      type: Date,
    },
    approvedBy: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (_doc, ret) {
        const { _id, __v, ...rest } = ret;
        return rest;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: function (_doc, ret) {
        const { _id, __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

ResupplyRequestSchema.index({ status: 1, requestedAt: -1 });
ResupplyRequestSchema.index({ resourceType: 1, status: 1 });
ResupplyRequestSchema.index({ priority: 1, status: 1 });

export const ResupplyRequestModel = mongoose.model<IResupplyRequest>(
  'ResupplyRequest',
  ResupplyRequestSchema
);
