import mongoose, { Schema, Document } from "mongoose";

export interface IResourceMetric extends Document {
  id: string;
  resourceId: string;
  resourceType: string;
  timestamp: Date;
  level: number;
  consumptionRate: number;
  metadata?: {
    temperature?: number;
    pressure?: number;
    humidity?: number;
  };
}

export interface IAnomaly extends Document {
  id: string;
  resourceId: string;
  resourceType: string;
  timestamp: Date;
  type: "spike" | "drop" | "leak_detected" | "unusual_pattern";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
}

const ResourceMetricSchema = new Schema<IResourceMetric>(
  {
    id: { type: String, required: true, unique: true, index: true },
    resourceId: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    level: { type: Number, required: true },
    consumptionRate: { type: Number, required: true },
    metadata: {
      temperature: { type: Number },
      pressure: { type: Number },
      humidity: { type: Number },
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
  }
);

// Compound indexes for efficient queries
ResourceMetricSchema.index({ resourceId: 1, timestamp: -1 });
ResourceMetricSchema.index({ resourceType: 1, timestamp: -1 });
ResourceMetricSchema.index({ timestamp: -1 });

// TTL index to auto-delete old metrics after 90 days
ResourceMetricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

const AnomalySchema = new Schema<IAnomaly>(
  {
    id: { type: String, required: true, unique: true, index: true },
    resourceId: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    type: {
      type: String,
      required: true,
      enum: ["spike", "drop", "leak_detected", "unusual_pattern"],
    },
    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"],
    },
    description: { type: String, required: true },
    expectedValue: { type: Number, required: true },
    actualValue: { type: Number, required: true },
    deviation: { type: Number, required: true },
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
  }
);

AnomalySchema.index({ resourceId: 1, timestamp: -1 });
AnomalySchema.index({ severity: 1, timestamp: -1 });

export const ResourceMetricModel = mongoose.model<IResourceMetric>(
  "ResourceMetric",
  ResourceMetricSchema
);
export const AnomalyModel = mongoose.model<IAnomaly>("Anomaly", AnomalySchema);
