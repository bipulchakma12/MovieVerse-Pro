import mongoose from 'mongoose';

const castSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Cast name is required'],
      trim: true,
    },
    photoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    bio: {
      type: String,
      trim: true,
    },
    birthDate: Date,
    nationality: String,
    roleType: {
      type: String,
      enum: ['actor', 'director', 'writer', 'producer', 'crew'],
      default: 'actor',
    },
  },
  {
    timestamps: true,
  }
);

export const Cast = mongoose.model('Cast', castSchema);
