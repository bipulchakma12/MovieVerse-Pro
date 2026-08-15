import mongoose from 'mongoose';

const tvShowSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'TV Show name is required'],
      trim: true,
      index: true,
    },
    originalName: {
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
      default: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80',
    },
    bannerUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    },
    trailerUrl: {
      type: String,
      default: 'https://www.youtube.com/embed/YoHD9XEInc0',
    },
    cinesrcUrl: {
      type: String,
      trim: true,
    },
    firstAirYear: {
      type: Number,
      default: 2024,
      index: true,
    },
    firstAirDate: Date,
    numberOfSeasons: {
      type: Number,
      default: 1,
    },
    numberOfEpisodes: {
      type: Number,
      default: 10,
    },
    originalLanguage: {
      type: String,
      default: 'English',
    },
    country: {
      type: String,
      default: 'United States',
    },
    ratingAverage: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10,
      index: true,
    },
    ratingCount: {
      type: Number,
      default: 100,
    },
    popularity: {
      type: Number,
      default: 50,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'Returning Series',
    },
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
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
        index: true,
      },
    ],
    seasons: [
      {
        seasonNumber: Number,
        episodeCount: Number,
        name: String,
        overview: String,
        posterPath: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

tvShowSchema.pre('save', function (next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      (this.tmdbId ? `-${this.tmdbId}` : '');
  }
  next();
});

// Text index for search
tvShowSchema.index({ name: 'text', storyline: 'text' }, { language_override: 'text_language' });

export const TvShow = mongoose.model('TvShow', tvShowSchema);
