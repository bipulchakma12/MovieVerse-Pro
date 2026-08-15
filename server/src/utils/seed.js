import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Genre, Cast, Movie, Review } from '../models/index.js';

dotenv.config();

const genresData = [
  { name: 'Action', slug: 'action', description: 'Fast-paced, high-stakes combat and stunts.' },
  { name: 'Sci-Fi', slug: 'sci-fi', description: 'Futuristic concepts, space exploration, and advanced technology.' },
  { name: 'Drama', slug: 'drama', description: 'Emotionally driven story and character development.' },
  { name: 'Thriller', slug: 'thriller', description: 'Suspense, mystery, and intense excitement.' },
  { name: 'Adventure', slug: 'adventure', description: 'Heroic journeys, epic quests, and discoveries.' },
  { name: 'Animation', slug: 'animation', description: 'Animated storytelling for all ages.' },
  { name: 'Crime', slug: 'crime', description: 'Criminal masterminds, detectives, and law enforcement.' },
  { name: 'Fantasy', slug: 'fantasy', description: 'Magical realms, mythical creatures, and epic sagas.' },
];

const castData = [
  { name: 'Christopher Nolan', roleType: 'director', bio: 'Renowned filmmaker known for non-linear storytelling.' },
  { name: 'Denis Villeneuve', roleType: 'director', bio: 'Canadian filmmaker known for Arrival, Blade Runner 2049, and Dune.' },
  { name: 'Leonardo DiCaprio', roleType: 'actor', bio: 'Academy Award winning actor.' },
  { name: 'Cillian Murphy', roleType: 'actor', bio: 'Acclaimed Irish film and theatre actor.' },
  { name: 'Timothée Chalamet', roleType: 'actor', bio: 'Acclaimed actor known for Dune and Call Me By Your Name.' },
  { name: 'Zendaya', roleType: 'actor', bio: 'American actress and singer.' },
  { name: 'Christian Bale', roleType: 'actor', bio: 'Versatile actor known for The Dark Knight trilogy.' },
  { name: 'Keanu Reeves', roleType: 'actor', bio: 'Iconic actor known for The Matrix and John Wick.' },
];

const moviesData = [
  {
    title: 'Inception',
    slug: 'inception',
    storyline: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    releaseYear: 2010,
    runtimeMinutes: 148,
    language: 'English',
    country: 'United States',
    ratingAverage: 8.8,
    ratingCount: 1540,
    viewsCount: 12400,
    isFeatured: true,
    isTrending: true,
  },
  {
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    storyline: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    videoUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    releaseYear: 2023,
    runtimeMinutes: 180,
    language: 'English',
    country: 'United States',
    ratingAverage: 8.9,
    ratingCount: 2310,
    viewsCount: 18900,
    isFeatured: true,
    isTrending: true,
  },
  {
    title: 'Interstellar',
    slug: 'interstellar',
    storyline: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    videoUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    releaseYear: 2014,
    runtimeMinutes: 169,
    language: 'English',
    country: 'United States',
    ratingAverage: 8.7,
    ratingCount: 1980,
    viewsCount: 24500,
    isFeatured: true,
    isTrending: false,
  },
  {
    title: 'Dune: Part Two',
    slug: 'dune-part-two',
    storyline: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    videoUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    releaseYear: 2024,
    runtimeMinutes: 166,
    language: 'English',
    country: 'United States',
    ratingAverage: 8.6,
    ratingCount: 1820,
    viewsCount: 21000,
    isFeatured: true,
    isTrending: true,
  },
  {
    title: 'The Dark Knight',
    slug: 'the-dark-knight',
    storyline: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
    videoUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
    releaseYear: 2008,
    runtimeMinutes: 152,
    language: 'English',
    country: 'United States',
    ratingAverage: 9.0,
    ratingCount: 3450,
    viewsCount: 32000,
    isFeatured: true,
    isTrending: true,
  },
  {
    title: 'The Matrix',
    slug: 'the-matrix',
    storyline: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth - the life he knows is the elaborate deception of an evil cyber-intelligence.',
    posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/embed/vKQi3bBA1y8',
    videoUrl: 'https://www.youtube.com/embed/vKQi3bBA1y8',
    releaseYear: 1999,
    runtimeMinutes: 136,
    language: 'English',
    country: 'United States',
    ratingAverage: 8.7,
    ratingCount: 2890,
    viewsCount: 29800,
    isFeatured: false,
    isTrending: true,
  },
  {
    title: 'Blade Runner 2049',
    slug: 'blade-runner-2049',
    storyline: 'Young Blade Runner K discovers a long-buried secret that leads him to track down former Blade Runner Rick Deckard, who has been missing for thirty years.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/embed/gCcx85zbxz4',
    videoUrl: 'https://www.youtube.com/embed/gCcx85zbxz4',
    releaseYear: 2017,
    runtimeMinutes: 164,
    language: 'English',
    country: 'United States',
    ratingAverage: 8.0,
    ratingCount: 1420,
    viewsCount: 16500,
    isFeatured: false,
    isTrending: true,
  },
  {
    title: 'Avatar: The Way of Water',
    slug: 'avatar-the-way-of-water',
    storyline: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0',
    videoUrl: 'https://www.youtube.com/embed/d9MyW72ELq0',
    releaseYear: 2022,
    runtimeMinutes: 192,
    language: 'English',
    country: 'United States',
    ratingAverage: 7.6,
    ratingCount: 1980,
    viewsCount: 27400,
    isFeatured: true,
    isTrending: true,
  },
  {
    title: 'Spider-Man: Into the Spider-Verse',
    slug: 'spider-man-into-the-spider-verse',
    storyline: 'Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.',
    posterUrl: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/embed/g4Hbz2jLxvQ',
    videoUrl: 'https://www.youtube.com/embed/g4Hbz2jLxvQ',
    releaseYear: 2018,
    runtimeMinutes: 117,
    language: 'English',
    country: 'United States',
    ratingAverage: 8.4,
    ratingCount: 2150,
    viewsCount: 22100,
    isFeatured: true,
    isTrending: true,
  },
  {
    title: 'Everything Everywhere All at Once',
    slug: 'everything-everywhere-all-at-once',
    storyline: 'A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/embed/wxN1T1uxQ2g',
    videoUrl: 'https://www.youtube.com/embed/wxN1T1uxQ2g',
    releaseYear: 2022,
    runtimeMinutes: 139,
    language: 'English',
    country: 'United States',
    ratingAverage: 8.8,
    ratingCount: 2780,
    viewsCount: 25600,
    isFeatured: true,
    isTrending: true,
  }
];

export const seedDatabase = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.log('Skipping database seeding - no MONGODB_URI provided.');
      return;
    }
    await mongoose.connect(connStr);
    console.log('🌱 Connected to DB for seeding YouTube movies...');

    await Promise.all([
      Genre.deleteMany({}),
      Cast.deleteMany({}),
      Movie.deleteMany({}),
    ]);

    const createdGenres = await Genre.insertMany(genresData);
    const createdCast = await Cast.insertMany(castData);

    const actionGenre = createdGenres.find(g => g.slug === 'action');
    const sciFiGenre = createdGenres.find(g => g.slug === 'sci-fi');
    const dramaGenre = createdGenres.find(g => g.slug === 'drama');
    const crimeGenre = createdGenres.find(g => g.slug === 'crime');
    const animationGenre = createdGenres.find(g => g.slug === 'animation');

    const moviesWithRefs = moviesData.map((movie, idx) => {
      let selectedGenres = [sciFiGenre?._id];
      if (idx % 3 === 0) selectedGenres.push(actionGenre?._id);
      if (idx % 3 === 1) selectedGenres.push(dramaGenre?._id);
      if (idx % 3 === 2) selectedGenres.push(crimeGenre?._id || animationGenre?._id);

      return {
        ...movie,
        genres: selectedGenres.filter(Boolean),
        castMembers: [
          { person: createdCast[idx % createdCast.length]._id, role: 'director' },
          { person: createdCast[(idx + 1) % createdCast.length]._id, characterName: 'Lead Role', role: 'actor' },
        ],
      };
    });

    await Movie.insertMany(moviesWithRefs);
    console.log(`✅ Database successfully wiped and re-seeded with 100% YouTube video streams for all ${moviesData.length} movies!`);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  }
};
