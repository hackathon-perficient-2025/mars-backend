import mongoose, { Schema, Document } from "mongoose";
import type { ResourceType } from "../types/resource.types";

export interface IResource extends Document {
  id: string;
  type: ResourceType;
  name: string;
  currentLevel: number;
  maxCapacity: number;
  unit: string;
  criticalThreshold: number;
  warningThreshold: number;
  lastUpdated: Date;
  trend?: "increasing" | "decreasing" | "stable";
  estimatedDaysRemaining?: number;
  consumptionRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "oxygen",
        "water",
        "spare_parts",
        "food",
        "trees",
        "solar_robots",
        "energy_storage",
        "medical_supplies",
        "sewage_capacity",
        "arable_land",
        "pollinators",
        "freshwater_aquifer",
        "batteries",
        "population",
      ],
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    currentLevel: {
      type: Number,
      required: true,
      min: 0,
    },
    maxCapacity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    criticalThreshold: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    warningThreshold: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    trend: {
      type: String,
      enum: ["increasing", "decreasing", "stable"],
    },
    estimatedDaysRemaining: {
      type: Number,
      min: 0,
    },
    consumptionRate: {
      type: Number,
      min: 0,
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

ResourceSchema.index({ type: 1, currentLevel: 1 });
ResourceSchema.index({ lastUpdated: -1 });

export const ResourceModel = mongoose.model<IResource>(
  "Resource",
  ResourceSchema
);
