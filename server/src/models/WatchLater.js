import mongoose from 'mongoose';

const watchLaterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

watchLaterSchema.index({ user: 1, movie: 1 }, { unique: true });

export const WatchLater = mongoose.model('WatchLater', watchLaterSchema);
