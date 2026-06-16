import Review from '../models/Review.js';
import Project from '../models/Project.js';
import Service from '../models/Service.js';
import User from '../models/User.js';

export const createReview = async (req, res) => {
  try {
    const { projectId, rating, comment } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the customer can review' });
    }
    if (project.status !== 'completed') {
      return res.status(400).json({ message: 'Project must be completed to review' });
    }
    const existing = await Review.findOne({ project: projectId, reviewer: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Already reviewed this project' });
    }
    const review = await Review.create({
      project: projectId,
      service: project.service,
      reviewer: req.user._id,
      provider: project.provider,
      rating,
      comment,
    });

    const allReviews = await Review.find({ provider: project.provider });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(project.provider, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    });

    const serviceReviews = await Review.find({ service: project.service });
    const serviceAvg =
      serviceReviews.reduce((s, r) => s + r.rating, 0) / serviceReviews.length;
    await Service.findByIdAndUpdate(project.service, {
      rating: Math.round(serviceAvg * 10) / 10,
      totalReviews: serviceReviews.length,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('reviewer', 'name avatar')
      .populate('service', 'title')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
