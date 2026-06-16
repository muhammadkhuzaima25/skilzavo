import Request from '../models/Request.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';

export const createRequest = async (req, res) => {
  try {
    const { serviceId, message } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.provider.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot request your own service' });
    }
    const existing = await Request.findOne({
      service: serviceId,
      customer: req.user._id,
      status: { $in: ['pending', 'accepted'] },
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this service' });
    }
    const request = await Request.create({
      service: serviceId,
      customer: req.user._id,
      provider: service.provider,
      message,
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerRequests = async (req, res) => {
  try {
    const requests = await Request.find({ customer: req.user._id })
      .populate('service', 'title price image')
      .populate('provider', 'name avatar')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProviderRequests = async (req, res) => {
  try {
    const requests = await Request.find({ provider: req.user._id })
      .populate('service', 'title price image')
      .populate('customer', 'name avatar email')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    request.status = status;
    await request.save();

    if (status === 'accepted') {
      const service = await Service.findById(request.service);
      await Project.create({
        request: request._id,
        service: request.service,
        customer: request.customer,
        provider: request.provider,
        title: service.title,
        description: service.description,
        budget: service.price,
        status: 'not-started',
      });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
