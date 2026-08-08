'use client';

import { useState, useEffect } from 'react';

const CATEGORIES = ['Darshan', 'Mahotsav', 'Decoration', 'Volunteers', 'Cultural Program'];

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Darshan');
  const [featured, setFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Search, Filter, Sort, Pagination
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch (err) {
      console.error('Error loading gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title || selectedFile.name);
        formData.append('category', category);
        formData.append('featured', featured);

        const res = await fetch('/api/gallery', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          showToast('Image uploaded successfully to Cloudinary!');
          fetchGallery();
          setSelectedFile(null);
          setTitle('');
          setFeatured(false);
        } else {
          showToast(data.message || 'Upload failed', 'error');
        }
      } else if (imageUrl) {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || 'Mahotsav Image',
            category,
            featured,
            imageUrl,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Image URL saved successfully!');
          fetchGallery();
          setImageUrl('');
          setTitle('');
          setFeatured(false);
        } else {
          showToast(data.message || 'Save failed', 'error');
        }
      }
    } catch (err) {
      showToast('Operation failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this photo from Cloudinary & Gallery?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setItems(items.filter((item) => item._id !== id));
        showToast('Image deleted successfully!');
      } else {
        showToast(data.message || 'Failed to delete', 'error');
      }
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  const toggleFeatured = async (item) => {
    try {
      const res = await fetch(`/api/gallery/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !item.featured }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(items.map((i) => (i._id === item._id ? data.data : i)));
        showToast(`Image ${!item.featured ? 'marked as Featured' : 'removed from Featured'}`);
      }
    } catch (err) {
      showToast('Failed to toggle featured state', 'error');
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const res = await fetch(`/api/gallery/${editingItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingItem.title,
          category: editingItem.category,
          featured: editingItem.featured,
          order: Number(editingItem.order || 0),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(items.map((i) => (i._id === editingItem._id ? data.data : i)));
        setEditingItem(null);
        showToast('Photo details updated!');
      }
    } catch (err) {
      showToast('Failed to update details', 'error');
    }
  };

  // Processed Items (Filtered, Searched, Sorted)
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'order') return (a.order || 0) - (b.order || 0);
    return 0;
  });

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const paginatedItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl backdrop-blur-xl transition-all ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-800 text-red-300'
              : 'bg-emerald-950/90 border-emerald-800 text-emerald-300'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-amber-400 font-heading">PHOTO GALLERY MANAGEMENT</h1>
          <p className="text-xs text-zinc-400 mt-1">Upload high-res images to Cloudinary, manage categories, featured images, and order.</p>
        </div>
        <div className="text-xs font-mono text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
          Total Images: <span className="text-amber-400 font-bold">{items.length}</span>
        </div>
      </div>

      {/* Upload Drag & Drop Box */}
      <div className="bg-zinc-900 border border-amber-500/20 p-5 rounded-2xl text-xs space-y-4">
        <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
          <span>📤</span> Upload New Image
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragActive
                ? 'border-amber-400 bg-amber-500/10'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-950/20'
                : 'border-zinc-700 bg-zinc-950/50 hover:border-zinc-500'
            }`}
          >
            {selectedFile ? (
              <div className="space-y-1">
                <p className="font-semibold text-emerald-400">Selected File: {selectedFile.name}</p>
                <p className="text-[10px] text-zinc-400 font-mono">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-[10px] text-red-400 hover:underline pt-1"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-zinc-300 font-medium">Drag & drop your image here or browse</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload-input"
                />
                <label
                  htmlFor="file-upload-input"
                  className="inline-block px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-semibold rounded-lg cursor-pointer border border-zinc-700 transition-colors"
                >
                  Choose File from Device
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. Grand Evening Aarti"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">OR External Image URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <label className="flex items-center space-x-2 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 bg-zinc-950"
              />
              <span>Mark as Featured Image</span>
            </label>

            <button
              type="submit"
              disabled={uploading || (!selectedFile && !imageUrl)}
              className="px-6 py-2.5 font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-xl transition-all disabled:opacity-50"
            >
              {uploading ? 'Uploading to Cloudinary...' : 'Upload & Save Image'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white w-full md:w-64"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="order">Sort: Custom Order</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-zinc-500 bg-zinc-900 rounded-2xl">
            Loading photo gallery...
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="col-span-full p-8 text-center text-zinc-500 bg-zinc-900 rounded-2xl">
            No gallery images found matching filters.
          </div>
        ) : (
          paginatedItems.map((item) => (
            <div key={item._id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col group relative">
              <div
                onClick={() => setPreviewImage(item.imageUrl)}
                className="relative h-44 w-full overflow-hidden bg-black cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-black/70 text-amber-300 rounded border border-amber-500/30">
                  {item.category}
                </span>

                {item.featured && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-black rounded">
                    ★ Featured
                  </span>
                )}
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between space-y-2 text-xs">
                <div>
                  <h4 className="font-bold text-white truncate">{item.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">Order: #{item.order || 0}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => toggleFeatured(item)}
                    className={`text-[10px] ${item.featured ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {item.featured ? '★ Featured' : '☆ Feature'}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 text-xs pt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-zinc-400 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Full Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-pointer"
        >
          <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
        </div>
      )}

      {/* Edit Details Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl max-w-md w-full text-white space-y-4">
            <h3 className="text-base font-bold text-amber-400">Edit Photo Details</h3>
            <form onSubmit={handleEditSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Order #</label>
                <input
                  type="number"
                  value={editingItem.order || 0}
                  onChange={(e) => setEditingItem({ ...editingItem, order: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-black font-bold rounded hover:bg-amber-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
