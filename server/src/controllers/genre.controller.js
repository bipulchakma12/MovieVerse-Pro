import { Genre } from '../models/Genre.js';

// @desc    Get all genres
// @route   GET /api/genres
// @access  Public
export const getGenres = async (req, res, next) => {
  try {
    const genres = await Genre.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, count: genres.length, data: genres });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single genre by ID or Slug
// @route   GET /api/genres/:idOrSlug
// @access  Public
export const getGenreByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const genre = isObjectId
      ? await Genre.findById(idOrSlug)
      : await Genre.findOne({ slug: idOrSlug });

    if (!genre) {
      return res.status(404).json({ success: false, message: 'Genre not found' });
    }
    res.status(200).json({ success: true, data: genre });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new genre (Admin)
// @route   POST /api/genres
// @access  Admin
export const createGenre = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const genre = await Genre.create({ name, slug, description });
    res.status(201).json({ success: true, message: 'Genre created successfully', data: genre });
  } catch (error) {
    next(error);
  }
};

// @desc    Update genre (Admin)
// @route   PUT /api/genres/:id
// @access  Admin
export const updateGenre = async (req, res, next) => {
  try {
    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!genre) {
      return res.status(404).json({ success: false, message: 'Genre not found' });
    }
    res.status(200).json({ success: true, message: 'Genre updated successfully', data: genre });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete genre (Admin)
// @route   DELETE /api/genres/:id
// @access  Admin
export const deleteGenre = async (req, res, next) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    if (!genre) {
      return res.status(404).json({ success: false, message: 'Genre not found' });
    }
    res.status(200).json({ success: true, message: 'Genre deleted successfully' });
  } catch (error) {
    next(error);
  }
};
