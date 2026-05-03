const Venue = require('../models/Venue');
const validateObjectId = require('../utils/validateObjectId');
const { createVenueSchema, updateVenueSchema } = require('../validations/venueValidation');
const { resolveStoredImagePath } = require('../middleware/uploadMiddleware');

// POST /api/venues
const createVenue = async (req, res, next) => {
  try {
    // If a file was uploaded, store its public path
    const body = { ...req.body };
    if (req.file) {
      try {
        body.image = await resolveStoredImagePath(req.file);
      } catch (uploadErr) {
        return res.status(400).json({ success: false, message: `Image upload failed: ${uploadErr.message}` });
      }
    } else if (body.image && typeof body.image !== 'string') {
      delete body.image;
    }

    const { error, value } = createVenueSchema.validate(body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const created = await Venue.create(value);
    return res.status(201).json({ success: true, message: 'Venue created', data: created });
  } catch (err) {
    next(err);
  }
};

// GET /api/venues
const getAllVenues = async (req, res, next) => {
  try {
    const items = await Venue.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'Venues fetched', data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/venues/:id
const getSingleVenue = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid venue id' });
    }
    const item = await Venue.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    return res.status(200).json({ success: true, message: 'Venue fetched', data: item });
  } catch (err) {
    next(err);
  }
};

// PUT /api/venues/:id
const updateVenue = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid venue id' });
    }

    const body = { ...req.body };
    if (req.file) {
      try {
        body.image = await resolveStoredImagePath(req.file);
      } catch (uploadErr) {
        return res.status(400).json({ success: false, message: `Image upload failed: ${uploadErr.message}` });
      }
    } else if (body.image && typeof body.image !== 'string') {
      delete body.image;
    }

    const { error, value } = updateVenueSchema.validate(body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const updated = await Venue.findByIdAndUpdate(id, value, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    return res.status(200).json({ success: true, message: 'Venue updated', data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/venues/:id
const deleteVenue = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid venue id' });
    }
    const deleted = await Venue.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    return res.status(200).json({ success: true, message: 'Venue deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createVenue,
  getAllVenues,
  getSingleVenue,
  updateVenue,
  deleteVenue,
};
