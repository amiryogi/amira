import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);
