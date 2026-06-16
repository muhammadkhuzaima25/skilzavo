import { useState, useEffect } from 'react';
import { ExternalLink, Eye, ImageIcon, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import API from '../../utils/axios';

const Portfolio = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', description: '', link: '', tags: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get('/api/auth/me').then((r) => setItems(r.data.portfolio || [])).catch(() => {});
  }, []);

  const handleImageUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({ title: '', category: '', description: '', link: '', tags: '' });
    setFile(null);
    setPreview('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || '',
      category: item.category || '',
      description: item.description || '',
      link: item.link || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
    });
    setFile(null);
    setPreview(item.image || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    if (!editingItem && !file) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('link', form.link);
      fd.append('tags', form.tags);
      if (file) fd.append('image', file);

      let data;
      if (editingItem) {
        const res = await API.put(`/api/auth/portfolio/${editingItem._id}`, fd);
        data = res.data;
      } else {
        const res = await API.post('/api/auth/portfolio', fd);
        data = res.data;
      }
      setItems(data);
      setShowModal(false);
      setEditingItem(null);
      setForm({ title: '', category: '', description: '', link: '', tags: '' });
      setFile(null);
      setPreview('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save portfolio item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    try {
      const { data } = await API.delete(`/api/auth/portfolio/${id}`);
      setItems(data);
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFile(null);
    setPreview('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading text-xl font-bold text-gray-900">My Portfolio</h2>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          Add Work
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ImageIcon size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No portfolio items yet</p>
          <p className="text-xs mt-1">Showcase your work by adding projects</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item._id}
              className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="relative aspect-[1280/769] bg-gray-50 overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon size={36} className="text-gray-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/60 transition-colors flex items-center justify-center gap-3">
                  <Eye size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-gray-800 text-sm truncate">{item.title}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mt-3">
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-xs font-medium hover:text-primary-dark flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      Live Link
                    </a>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-gray-400 hover:text-primary p-1"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-heading font-semibold text-gray-900">
                {editingItem ? 'Edit Portfolio Item' : 'Add Work to Portfolio'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. E-commerce Website Redesign"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select</option>
                  <option>Web Development</option>
                  <option>Graphic Design</option>
                  <option>Content Writing</option>
                  <option>Digital Marketing</option>
                  <option>Video Editing</option>
                  <option>UI/UX Design</option>
                  <option>SEO</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Image {!editingItem && <span className="text-red-400">*</span>}
                  {editingItem && <span className="text-gray-400 text-xs"> (leave empty to keep current)</span>}
                </label>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => document.getElementById('portfolio-img')?.click()}
                >
                  {preview ? (
                    <div className="relative inline-block">
                      <img src={preview} alt="" className="max-h-28 rounded-lg object-cover" />
                      {!editingItem || file ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(''); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <Upload size={24} className="mx-auto mb-1 opacity-40" />
                      <p className="text-xs">Click to upload image</p>
                    </div>
                  )}
                  <input
                    id="portfolio-img"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Live Link (optional)</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (optional)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="comma separated"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !form.title || (!editingItem && !file)}
                  className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:bg-gray-300"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Update' : 'Add to Portfolio'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-500 px-5 py-2.5 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
