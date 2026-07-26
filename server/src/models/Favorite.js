import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
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

favoriteSchema.index({ user: 1, movie: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', favoriteSchema);
