import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  DollarSign,
  FileImage,
  Minus,
  Plus,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import API from '../../utils/axios';

const REVISION_OPTIONS = ['1', '2', '3', '5', 'Unlimited'];
const ANSWER_TYPES = ['Short Answer', 'Long Answer', 'File Upload'];

const CATEGORIES = [
  'Web Development',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Video Editing',
  'Other',
];

const SUB_CATEGORIES = {
  'Web Development': ['Frontend Development', 'Backend Development', 'Full Stack Development', 'WordPress', 'E-commerce', 'CMS Development'],
  'Graphic Design': ['Logo Design', 'Brand Identity', 'Social Media Design', 'Print Design', 'Illustration', 'UI/UX Design'],
  'Content Writing': ['Blog Writing', 'Copywriting', 'Technical Writing', 'Script Writing', 'Proofreading', 'Creative Writing'],
  'Digital Marketing': ['Social Media Marketing', 'SEO', 'Email Marketing', 'PPC Advertising', 'Content Marketing', 'Analytics'],
  'Video Editing': ['Short Form Editing', 'Long Form Editing', 'Motion Graphics', 'Animation', 'Color Grading', 'VFX'],
  'Other': ['Consulting', 'Virtual Assistant', 'Data Entry', 'Transcription', 'Translation', 'Research'],
};

const STEPS = [
  { num: 1, label: 'Service Overview' },
  { num: 2, label: 'Pricing & Packages' },
  { num: 3, label: 'Requirements' },
  { num: 4, label: 'Review & Publish' },
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const getInitialState = () => ({
  title: '',
  category: '',
  subCategory: '',
  description: '',
  tags: [],
  tagInput: '',
  thumbnail: null,
  thumbnailPreview: '',
  thumbnailUploading: false,
  existingThumbnail: '',
  price: '',
  priceError: '',
  deliveryTime: 7,
  deliveryError: '',
  revisions: '1',
  addOns: [],
  instructions: '',
  requiredFiles: false,
  questions: [],
  submitting: false,
});

const clampDelivery = (val) => Math.max(1, Math.min(10, val));

const CreateServiceForm = ({ editServiceId, onClose, onCreated, onUpdated, onPublish }) => {
  const { formatPrice } = useCurrency();
  const isEditing = !!editServiceId;
  const [step, setStep] = useState(1);
  const [state, setState] = useState(getInitialState());
  const [loadingService, setLoadingService] = useState(false);

  const set = (field, value) => setState((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    if (!editServiceId) return;
    setLoadingService(true);
    API.get(`/api/services/${editServiceId}`)
      .then(({ data }) => {
        setState({
          ...getInitialState(),
          title: data.title || '',
          category: data.category || '',
          subCategory: data.subCategory || '',
          description: data.description || '',
          tags: data.tags || [],
          existingThumbnail: data.thumbnail || '',
          thumbnailPreview: data.thumbnail || '',
          price: data.price || '',
          deliveryTime: data.deliveryTime || 7,
          revisions: data.revisions || '1',
          addOns: data.addOns || [],
          instructions: data.instructions || '',
          requiredFiles: data.requiredFiles || false,
          questions: data.questions || [],
        });
      })
      .catch(() => alert('Failed to load service'))
      .finally(() => setLoadingService(false));
  }, [editServiceId]);

  const addTag = () => {
    const tag = state.tagInput.trim();
    if (tag && state.tags.length < 5 && !state.tags.includes(tag)) {
      set('tags', [...state.tags, tag]);
      set('tagInput', '');
    }
  };

  const removeTag = (tag) => set('tags', state.tags.filter((t) => t !== tag));

  const addAddOn = () => {
    if (state.addOns.length < 3) {
      set('addOns', [...state.addOns, { label: '', price: null, extraDays: 0 }]);
    }
  };

  const updateAddOn = (index, field, value) => {
    const updated = state.addOns.map((a, i) => (i === index ? { ...a, [field]: value } : a));
    set('addOns', updated);
  };

  const removeAddOn = (index) => set('addOns', state.addOns.filter((_, i) => i !== index));

  const addQuestion = () => {
    if (state.questions.length < 5) {
      set('questions', [...state.questions, { question: '', answerType: 'short' }]);
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = state.questions.map((q, i) => (i === index ? { ...q, [field]: value } : q));
    set('questions', updated);
  };

  const removeQuestion = (index) => set('questions', state.questions.filter((_, i) => i !== index));

  const handleImageUpload = (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Only JPG, PNG, and WEBP files are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB.');
      return;
    }
    set('thumbnailUploading', true);
    set('thumbnailPreview', URL.createObjectURL(file));
    set('thumbnail', file);
    set('existingThumbnail', '');
    set('thumbnailUploading', false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const validatePrice = (val) => {
    const num = Number(val);
    if (!val || isNaN(num)) {
      set('priceError', '');
      set('price', val);
      return;
    }
    if (num < 5 || num % 5 !== 0) {
      const rounded = Math.round(num / 5) * 5;
      const finalVal = Math.max(5, rounded);
      set('priceError', 'Price must be minimum $5 and in multiples of $5');
      set('price', finalVal);
    } else {
      set('priceError', '');
      set('price', num);
    }
  };

  const handleSubmit = async (publish) => {
    set('submitting', true);
    try {
      const formData = new FormData();
      formData.append('title', state.title);
      formData.append('description', state.description);
      formData.append('category', state.category);
      formData.append('subCategory', state.subCategory);
      formData.append('price', state.price);
      formData.append('deliveryTime', String(state.deliveryTime));
      formData.append('revisions', state.revisions);
      formData.append('instructions', state.instructions);
      formData.append('requiredFiles', state.requiredFiles);
      formData.append('status', publish ? 'published' : 'draft');
      state.tags.forEach((t) => formData.append('tags[]', t));
      formData.append('addOns', JSON.stringify(state.addOns));
      formData.append('questions', JSON.stringify(state.questions));
      if (state.thumbnail) formData.append('image', state.thumbnail);

      if (isEditing) {
        await API.put(`/api/services/${editServiceId}`, formData);
        onUpdated?.();
      } else {
        const { data } = await API.post('/api/services', formData);
        onCreated?.(data);
        if (publish) onPublish?.();
      }
    } catch (err) {
      alert(err.response?.data?.message || (isEditing ? 'Failed to update service' : 'Failed to create service'));
    } finally {
      set('submitting', false);
    }
  };

  const canGoNext = () => {
    if (step === 1) {
      return (
        state.title.trim().length > 0 &&
        state.category &&
        state.subCategory &&
        state.description.trim().length >= 100 &&
        state.tags.length >= 1 &&
        (!!state.thumbnail || !!state.existingThumbnail)
      );
    }
    if (step === 2) {
      const num = Number(state.price);
      return !isNaN(num) && num >= 5 && num % 5 === 0 && state.deliveryTime >= 1 && state.deliveryTime <= 10;
    }
    if (step === 3) return true;
    return true;
  };

  const next = () => {
    if (step < 4 && canGoNext()) setStep(step + 1);
  };
  const prev = () => { if (step > 1) setStep(step - 1); };

  if (loadingService) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <p className="text-gray-500">Loading service...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-heading text-lg font-bold text-gray-900">{isEditing ? 'Edit Service' : 'Create New Service'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center">
            {STEPS.map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step > s.num
                        ? 'bg-primary text-white'
                        : step === s.num
                        ? 'bg-primary text-white ring-4 ring-primary-50'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step > s.num ? <Check size={14} /> : s.num}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    step >= s.num ? 'text-primary-dark' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 ${
                      step > s.num ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Service Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={state.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. I will design your brand logo"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {state.title.trim().length === 0 && <p className="text-xs text-red-400 mt-1">Required</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={state.category}
                      onChange={(e) => { set('category', e.target.value); set('subCategory', ''); }}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {!state.category && <p className="text-xs text-red-400 mt-1">Required</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Sub Category <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={state.subCategory}
                      onChange={(e) => set('subCategory', e.target.value)}
                      disabled={!state.category}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50"
                    >
                      <option value="">Select sub category</option>
                      {(SUB_CATEGORIES[state.category] || []).map((sc) => (
                        <option key={sc} value={sc}>{sc}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {state.category && !state.subCategory && <p className="text-xs text-red-400 mt-1">Required</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-400">*</span>
                  <span className="text-gray-400 font-normal ml-1">({state.description.length}/100 min)</span>
                </label>
                <textarea
                  value={state.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe your service in detail. What will you deliver? What makes it great?"
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {state.description.trim().length > 0 && state.description.trim().length < 100 && (
                  <p className="text-xs text-red-400 mt-1">Minimum 100 characters required ({100 - state.description.trim().length} more)</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Tag size={14} className="inline mr-1 text-primary" />
                  Tags / Keywords <span className="text-red-400">*</span>
                  <span className="text-gray-400 font-normal"> (max 5)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {state.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-primary-50 text-primary-dark px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-primary-900">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={state.tagInput}
                    onChange={(e) => set('tagInput', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Type a tag and press Enter"
                    disabled={state.tags.length >= 5}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={state.tags.length >= 5 || !state.tagInput.trim()}
                  className="bg-primary text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:bg-gray-300"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {state.tags.length === 0 && <p className="text-xs text-red-400 mt-1">Add at least 1 tag</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Upload size={14} className="inline mr-1 text-primary" />
                  Service Thumbnail {!isEditing && <span className="text-red-400">*</span>}
                  {isEditing && <span className="text-gray-400 font-normal"> (leave empty to keep current)</span>}
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => document.getElementById('thumb-input')?.click()}
                >
                  {state.thumbnailPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={state.thumbnailPreview}
                        alt="Preview"
                        className="max-h-40 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); set('thumbnailPreview', ''); set('thumbnail', null); set('existingThumbnail', ''); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <FileImage size={40} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-medium">Drag & drop or click to upload</p>
                      <p className="text-xs mt-1">JPG, PNG, WebP &bull; Max 5MB</p>
                      <p className="text-xs text-gray-300 mt-0.5">Recommended: 1280 x 769px (16:9 ratio)</p>
                    </div>
                  )}
                  <input
                    id="thumb-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => { if (e.target.files[0]) handleImageUpload(e.target.files[0]); }}
                  />
                </div>
                {!isEditing && !state.thumbnail && <p className="text-xs text-red-400 mt-1">Required</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <DollarSign size={14} className="inline mr-1 text-primary" />
                  Base Price <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
                  <input
                    type="number"
                    value={state.price}
                    onChange={(e) => validatePrice(e.target.value)}
                    placeholder="e.g. $25"
                    min="5"
                    step="5"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                {state.priceError && (
                  <p className="text-xs text-red-400 mt-1">{state.priceError}</p>
                )}
                {Number(state.price) >= 5 && Number(state.price) % 5 === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    = {formatPrice(state.price)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Delivery Time (Days) <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => set('deliveryTime', clampDelivery(state.deliveryTime - 1))}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-all"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        value={state.deliveryTime}
                        onChange={(e) => {
                          const val = clampDelivery(Number(e.target.value) || 1);
                          set('deliveryTime', val);
                          if (val < 1 || val > 10) set('deliveryError', 'Delivery time must be between 1-10 days');
                          else set('deliveryError', '');
                        }}
                        min="1"
                        max="10"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => set('deliveryTime', clampDelivery(state.deliveryTime + 1))}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {state.deliveryError && <p className="text-xs text-red-400 mt-1">{state.deliveryError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Revisions <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={state.revisions}
                      onChange={(e) => set('revisions', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      {REVISION_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r === 'Unlimited' ? 'Unlimited' : `${r} Revision${r !== '1' ? 's' : ''}`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Services <span className="text-gray-400 font-normal">(optional, max 3)</span>
                  </label>
                  {state.addOns.length < 3 && (
                    <button
                      type="button"
                      onClick={addAddOn}
                      className="text-primary text-sm font-medium hover:text-primary-dark flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Add-on
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {state.addOns.map((addon, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500">Add-on {idx + 1}</span>
                        <button type="button" onClick={() => removeAddOn(idx)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={addon.label}
                          onChange={(e) => updateAddOn(idx, 'label', e.target.value)}
                          placeholder="e.g. Extra Logo Concept"
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <div className="flex flex-wrap gap-1 items-center">
                          {[5, 10, 25, 50].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => updateAddOn(idx, 'price', p)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                addon.price === p
                                  ? 'border-primary bg-primary-50 text-primary-dark'
                                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
                              }`}
                            >
                              +${p}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          value={addon.extraDays}
                          onChange={(e) => updateAddOn(idx, 'extraDays', Number(e.target.value))}
                          placeholder="+ days"
                          min="0"
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <p className="text-sm text-gray-400">All fields in this step are optional.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Instructions to Buyer
                </label>
                <textarea
                  value={state.instructions}
                  onChange={(e) => set('instructions', e.target.value)}
                  placeholder="What do you need from the client to start working? e.g. Provide brand guidelines, logo files, color palette..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Files from Client</label>
                <div className="flex gap-3">
                  {['No', 'Yes'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set('requiredFiles', opt === 'Yes')}
                      className={`px-5 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        (opt === 'Yes') === state.requiredFiles
                          ? 'border-primary bg-primary-50 text-primary-dark'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Custom Questions <span className="text-gray-400 font-normal">(optional, max 5)</span>
                  </label>
                  {state.questions.length < 5 && (
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="text-primary text-sm font-medium hover:text-primary-dark flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Question
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {state.questions.map((q, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500">Question {idx + 1}</span>
                        <button type="button" onClick={() => removeQuestion(idx)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                          placeholder="e.g. What is your brand style?"
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <div className="flex gap-1.5 flex-wrap">
                          {ANSWER_TYPES.map((at) => (
                            <button
                              key={at}
                              type="button"
                              onClick={() => updateQuestion(idx, 'answerType', at === 'Short Answer' ? 'short' : at === 'Long Answer' ? 'long' : 'file')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                q.answerType === (at === 'Short Answer' ? 'short' : at === 'Long Answer' ? 'long' : 'file')
                                  ? 'border-primary bg-primary-50 text-primary-dark'
                                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
                              }`}
                            >
                              {at}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-gray-900">{isEditing ? 'Review Changes' : 'Review Your Service'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Service Title</p>
                  <p className="text-sm font-medium text-gray-800">{state.title}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="text-sm font-medium text-gray-800">{state.category} / {state.subCategory}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="text-sm font-medium text-primary">{formatPrice(state.price)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Delivery</p>
                  <p className="text-sm font-medium text-gray-800">{state.deliveryTime} day{state.deliveryTime > 1 ? 's' : ''}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Revisions</p>
                  <p className="text-sm font-medium text-gray-800">
                    {state.revisions === 'Unlimited' ? 'Unlimited' : `${state.revisions} Revision${state.revisions !== '1' ? 's' : ''}`}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Required Files</p>
                  <p className="text-sm font-medium text-gray-800">{state.requiredFiles ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {state.thumbnailPreview && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Thumbnail</p>
                  <img
                    src={state.thumbnailPreview}
                    alt="Thumbnail"
                    className="max-h-28 rounded-lg object-cover"
                  />
                </div>
              )}

              {state.tags.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {state.tags.map((t) => (
                      <span key={t} className="bg-primary-50 text-primary-dark px-2.5 py-0.5 rounded-full text-xs font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {state.addOns.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Additional Services</p>
                  {state.addOns.map((a, i) => (
                    <p key={i} className="text-sm text-gray-700">
                      {a.label} — <span className="text-primary font-medium">+${a.price}</span>
                      {a.extraDays > 0 && <span className="text-gray-400"> +{a.extraDays} day{a.extraDays > 1 ? 's' : ''}</span>}
                    </p>
                  ))}
                </div>
              )}

              {state.questions.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Questions for Client</p>
                  {state.questions.map((q, i) => (
                    <p key={i} className="text-sm text-gray-700">{i + 1}. {q.question} <span className="text-gray-400 text-xs">({q.answerType})</span></p>
                  ))}
                </div>
              )}

              {state.instructions && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Instructions to Buyer</p>
                  <p className="text-sm text-gray-700">{state.instructions}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-5 flex items-center justify-between">
          <button
            onClick={step === 1 ? onClose : prev}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <div className="flex gap-2">
            {step === 4 ? (
              <>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={state.submitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {state.submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Save as Draft'}
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={state.submitting}
                  className="inline-flex items-center gap-1.5 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {state.submitting ? (isEditing ? 'Saving...' : 'Publishing...') : (isEditing ? 'Update & Publish' : 'Publish Service')}
                  {!state.submitting && <ArrowRight size={16} />}
                </button>
              </>
            ) : (
              <button
                onClick={next}
                disabled={!canGoNext()}
                className="inline-flex items-center gap-1.5 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceForm;
