import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    imdbId: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    originalTitle: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    storyline: {
      type: String,
      default: 'No overview available.',
      trim: true,
    },
    posterUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    },
    bannerUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    },
    trailerUrl: {
      type: String,
      default: 'https://www.youtube.com/embed/YoHD9XEInc0',
    },
    videoUrl: {
      type: String,
      default: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    cinesrcUrl: {
      type: String,
      trim: true,
    },
    releaseYear: {
      type: Number,
      default: 2024,
      index: true,
    },
    releaseDate: Date,
    runtimeMinutes: {
      type: Number,
      default: 120,
    },
    language: {
      type: String,
      default: 'English',
      index: true,
    },
    country: {
      type: String,
      default: 'United States',
      index: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
      index: true,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    popularity: {
      type: Number,
      default: 0,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
      index: true,
    },
    budget: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    adult: {
      type: Boolean,
      default: false,
    },
    homepage: String,
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
        index: true,
      },
    ],
    castMembers: [
      {
        person: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Cast',
        },
        characterName: String,
        role: {
          type: String,
          enum: ['actor', 'director', 'writer', 'producer', 'crew'],
          default: 'actor',
        },
      },
    ],
    keywords: [String],
    productionCompanies: [
      {
        id: Number,
        name: String,
        logoPath: String,
        originCountry: String,
      },
    ],
    productionCountries: [
      {
        iso_3166_1: String,
        name: String,
      },
    ],
    streamingProviders: [
      {
        providerId: Number,
        providerName: String,
        logoPath: String,
      },
    ],
    posters: [String],
    backdrops: [String],
    trailers: [mongoose.Schema.Types.Mixed],
  },
  {
    timestamps: true,
  }
);

movieSchema.pre('save', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      (this.tmdbId ? `-${this.tmdbId}` : '');
  }
  next();
});

// Text index for search functionality
movieSchema.index({ title: 'text', storyline: 'text' }, { language_override: 'text_language' });

export const Movie = mongoose.model('Movie', movieSchema);
