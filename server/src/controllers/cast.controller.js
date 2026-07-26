import { Cast } from '../models/Cast.js';

// @desc    Get all cast members
// @route   GET /api/cast
// @access  Public
export const getCastMembers = async (req, res, next) => {
  try {
    const { search, roleType } = req.query;
    const filter = {};

    if (search) {
      filter.name = new RegExp(search, 'i');
    }
    if (roleType) {
      filter.roleType = roleType;
    }

    const castMembers = await Cast.find(filter).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: castMembers.length,
      data: castMembers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single cast member
// @route   GET /api/cast/:id
// @access  Public
export const getCastById = async (req, res, next) => {
  try {
    const cast = await Cast.findById(req.params.id);
    if (!cast) {
      return res.status(404).json({ success: false, message: 'Cast member not found' });
    }
    res.status(200).json({ success: true, data: cast });
  } catch (error) {
    next(error);
  }
};

// @desc    Create cast member (Admin)
// @route   POST /api/cast
// @access  Admin
export const createCastMember = async (req, res, next) => {
  try {
    const cast = await Cast.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Cast member created successfully',
      data: cast,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cast member (Admin)
// @route   PUT /api/cast/:id
// @access  Admin
export const updateCastMember = async (req, res, next) => {
  try {
    const cast = await Cast.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cast) {
      return res.status(404).json({ success: false, message: 'Cast member not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Cast member updated successfully',
      data: cast,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete cast member (Admin)
// @route   DELETE /api/cast/:id
// @access  Admin
export const deleteCastMember = async (req, res, next) => {
  try {
    const cast = await Cast.findByIdAndDelete(req.params.id);
    if (!cast) {
      return res.status(404).json({ success: false, message: 'Cast member not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Cast member deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
