import mongoose, { Schema, Document } from 'mongoose';

export interface IResourceHistory extends Document {
  resourceId: string;
  timestamp: Date;
  level: number;
}

const ResourceHistorySchema = new Schema<IResourceHistory>(
  {
    resourceId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    level: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: false,
  }
);

ResourceHistorySchema.index({ resourceId: 1, timestamp: -1 });

export const ResourceHistoryModel = mongoose.model<IResourceHistory>(
  'ResourceHistory',
  ResourceHistorySchema
);
