import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
    avatar: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    skills: [{ type: String }],
    experience: { type: String, default: '' },
    bio: { type: String, default: '' },
    hourlyRate: { type: Number, default: 0 },
    username: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    languages: [{ type: String }],
    portfolioWebsite: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    fiverrUrl: { type: String, default: '' },
    portfolio: [{ title: String, description: String, image: String, link: String }],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
