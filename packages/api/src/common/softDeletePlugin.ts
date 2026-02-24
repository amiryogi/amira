import { Schema, Query } from 'mongoose';

/**
 * Mongoose plugin that automatically filters out soft-deleted documents.
 * Adds { isDeleted: false } to all find/findOne/countDocuments queries.
 */
export function softDeletePlugin(schema: Schema): void {
  schema.add({ isDeleted: { type: Boolean, default: false, index: true } });

  const applyFilter = function (this: Query<unknown, unknown>) {
    const filter = this.getFilter();
    if (filter.isDeleted === undefined) {
      this.where({ isDeleted: false });
    }
  };

  schema.pre('find', applyFilter);
  schema.pre('findOne', applyFilter);
  schema.pre('countDocuments', applyFilter);
  schema.pre('findOneAndUpdate', applyFilter);
}
