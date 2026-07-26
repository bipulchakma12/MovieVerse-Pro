import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: String,
      required: [true, 'Reply text cannot be empty'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Rating (1-10) is required'],
      min: 1,
      max: 10,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: [replySchema],
  },
  {
    timestamps: true,
  }
);

// One review per user per movie
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
