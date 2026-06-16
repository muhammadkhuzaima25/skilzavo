import Service from '../models/Service.js';

export const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id }).populate('provider', 'name avatar rating');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const { category, search, provider } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (provider) filter.provider = provider;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const services = await Service.find(filter).populate('provider', 'name avatar rating');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      'provider',
      'name avatar email skills experience hourlyRate rating totalReviews bio location languages'
    );
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can create services' });
    }
    const parseJSON = (val) => {
      if (typeof val === 'string') try { return JSON.parse(val); } catch { return val; }
      return val || [];
    };
    const {
      title, description, category, subCategory, price,
      deliveryTime, revisions, tags, addOns,
      instructions, requiredFiles, questions, status,
    } = req.body;
    const thumbnail = req.file?.path || '';
    const service = await Service.create({
      title,
      description,
      category,
      subCategory: subCategory || '',
      price,
      deliveryTime,
      revisions: revisions || '1',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      addOns: parseJSON(addOns),
      instructions: instructions || '',
      requiredFiles: requiredFiles === true || requiredFiles === 'true',
      questions: parseJSON(questions),
      status: status || 'published',
      provider: req.user._id,
      thumbnail,
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const parseJSON = (val) => {
      if (typeof val === 'string') try { return JSON.parse(val); } catch { return val; }
      return val || [];
    };
    const fields = [
      'title', 'description', 'category', 'subCategory', 'price',
      'deliveryTime', 'revisions', 'tags', 'addOns',
      'instructions', 'requiredFiles', 'questions', 'status',
    ];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        let val = req.body[field];
        if (['addOns', 'questions'].includes(field)) val = parseJSON(val);
        if (field === 'tags') val = Array.isArray(val) ? val : (val ? [val] : []);
        if (field === 'requiredFiles') val = val === true || val === 'true';
        service[field] = val;
      }
    }
    if (req.file) {
      service.thumbnail = req.file.path;
    }
    service = await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
