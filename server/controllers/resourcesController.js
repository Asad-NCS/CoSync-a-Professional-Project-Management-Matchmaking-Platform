const Resource = require('../models/Resource');

exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ project: req.params.projectId }).populate('addedBy', 'fullName email').sort('-createdAt');
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addResource = async (req, res) => {
  try {
    const { name, type, url } = req.body;
    let finalUrl = url;
    
    if (type === 'file' && req.file) {
      finalUrl = `/uploads/${req.file.filename}`;
    } else if (type === 'file' && !req.file) {
      return res.status(400).json({ success: false, error: "File is required for type 'file'" });
    }

    const resource = await Resource.create({
      project: req.params.projectId,
      name,
      type,
      url: finalUrl,
      addedBy: req.user._id
    });
    
    const populated = await resource.populate('addedBy', 'fullName email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, error: "Resource not found" });
    
    await resource.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
