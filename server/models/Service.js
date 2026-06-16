import mongoose from 'mongoose';

const addOnSchema = new mongoose.Schema({
  label: { type: String, required: true },
  price: { type: Number, required: true },
  extraDays: { type: Number, default: 0 },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answerType: { type: String, enum: ['short', 'long', 'file'], default: 'short' },
}, { _id: false });

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, default: '' },
    price: { type: Number, required: true },
    thumbnail: { type: String, default: '' },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deliveryTime: { type: String, default: '7' },
    revisions: { type: String, default: '1' },
    tags: [{ type: String }],
    addOns: [addOnSchema],
    instructions: { type: String, default: '' },
    requiredFiles: { type: Boolean, default: false },
    questions: [questionSchema],
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Service', serviceSchema);
