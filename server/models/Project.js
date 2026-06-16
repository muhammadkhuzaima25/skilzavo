import mongoose from 'mongoose';

const phaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
});

const projectSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'cancelled'],
      default: 'not-started',
    },
    phases: [phaseSchema],
    budget: { type: Number, required: true },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

projectSchema.virtual('progress').get(function () {
  if (!this.phases.length) return 0;
  const completed = this.phases.filter((p) => p.status === 'completed').length;
  return Math.round((completed / this.phases.length) * 100);
});

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

export default mongoose.model('Project', projectSchema);
