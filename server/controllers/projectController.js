import Project from '../models/Project.js';

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('customer', 'name avatar email')
      .populate('provider', 'name avatar email')
      .populate('service', 'title price image thumbnail');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ customer: req.user._id }, { provider: req.user._id }],
    })
      .populate('customer', 'name avatar')
      .populate('provider', 'name avatar')
      .populate('service', 'title image thumbnail price')
      .sort('-createdAt');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (
      project.provider.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    project.status = status;
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTimeline = async (req, res) => {
  try {
    const { phases } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the provider can update timeline' });
    }
    project.phases = phases;
    const allCompleted = phases.every((p) => p.status === 'completed');
    if (allCompleted) {
      project.status = 'completed';
    } else if (phases.some((p) => p.status === 'in-progress' || p.status === 'completed')) {
      project.status = 'in-progress';
    }
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markPhaseComplete = async (req, res) => {
  try {
    const { phaseIndex } = req.params;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the provider can update phases' });
    }
    const phase = project.phases[phaseIndex];
    if (!phase) return res.status(404).json({ message: 'Phase not found' });
    phase.status = 'completed';
    phase.completedAt = new Date();
    const allCompleted = project.phases.every((p) => p.status === 'completed');
    if (allCompleted) project.status = 'completed';
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('customer', 'name avatar')
      .populate('provider', 'name avatar')
      .populate('service', 'title image thumbnail')
      .sort('-createdAt');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
