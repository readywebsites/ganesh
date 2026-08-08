'use client';

import { useState, useEffect } from 'react';

export default function AdminMediaManager() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedFile, setSelectedFile] = useState(null);
  const [folderName, setFolderName] = useState('General');
  const [renamingItem, setRenamingItem] = useState(null);
  const [newName, setNewName] = useState('');

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (folderFilter !== 'All') params.set('folder', folderFilter);
      if (typeFilter !== 'All') params.set('type', typeFilter);

      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json();
      if (data.success) setMediaList(data.data || []);
    } catch (err) {
      console.error('Error fetching media library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [search, folderFilter, typeFilter]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', folderName);

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        fetchMedia();
        setSelectedFile(null);
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this media file permanently?')) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMediaList(mediaList.filter((m) => m._id !== id));
      }
    } catch (err) {
      alert('Failed to delete media file');
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!renamingItem || !newName) return;
    try {
      const res = await fetch(`/api/media/${renamingItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (data.success) {
        setMediaList(mediaList.map((m) => (m._id === renamingItem._id ? data.data : m)));
        setRenamingItem(null);
        setNewName('');
      }
    } catch (err) {
      alert('Failed to rename file');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-amber-400 font-heading">MEDIA MANAGER & ASSET LIBRARY</h1>
          <p className="text-xs text-zinc-400 mt-1">Central repository for images, video files, logos, and documents.</p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-zinc-900 border border-amber-500/20 p-5 rounded-2xl text-xs space-y-3">
        <h3 className="font-bold text-sm text-amber-300">📤 Upload Asset to Cloud Directory</h3>
        <form onSubmit={handleFileUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-zinc-400 mb-1">Target Folder</label>
            <select
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
            >
              <option value="General">General</option>
              <option value="Gallery">Gallery</option>
              <option value="Banners">Banners</option>
              <option value="Logos">Logos</option>
              <option value="Documents">Documents</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Choose Media File</label>
            <input
              type="file"
              required
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-zinc-400 text-xs bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-2 font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-lg transition-all disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Media Asset'}
            </button>
          </div>
        </form>
      </div>

      {/* Search & Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/60 p-4 border border-zinc-800 rounded-xl">
        <input
          type="text"
          placeholder="Search media files by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        />

        <select
          value={folderFilter}
          onChange={(e) => setFolderFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="All">All Folders</option>
          <option value="General">General</option>
          <option value="Gallery">Gallery</option>
          <option value="Banners">Banners</option>
          <option value="Logos">Logos</option>
          <option value="Documents">Documents</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="All">All File Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
        </select>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-zinc-500 bg-zinc-900 rounded-2xl">
            Loading media items...
          </div>
        ) : mediaList.length === 0 ? (
          <div className="col-span-full p-8 text-center text-zinc-500 bg-zinc-900 rounded-2xl">
            No media files found in library.
          </div>
        ) : (
          mediaList.map((m) => (
            <div key={m._id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col group">
              <div className="relative h-36 w-full bg-black flex items-center justify-center overflow-hidden">
                {m.type === 'image' || m.type === 'logo' ? (
                  <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <span className="text-4xl">{m.type === 'video' ? '🎬' : '📄'}</span>
                )}
                <span className="absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-0.5 bg-black/80 text-amber-300 rounded border border-amber-500/30">
                  📁 {m.folder}
                </span>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between space-y-2 text-xs">
                <div>
                  <h4 className="font-bold text-white truncate" title={m.name}>{m.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    {m.size ? `${(m.size / 1024).toFixed(1)} KB` : 'Cloud Asset'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[10px]">
                  <button
                    onClick={() => {
                      setRenamingItem(m);
                      setNewName(m.name);
                    }}
                    className="text-blue-400 hover:underline"
                  >
                    Rename
                  </button>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(m._id)}
                    className="text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rename Modal */}
      {renamingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl max-w-md w-full text-white space-y-4">
            <h3 className="text-base font-bold text-amber-400">Rename Media File</h3>
            <form onSubmit={handleRename} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Filename</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setRenamingItem(null)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-black font-bold rounded hover:bg-amber-400"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
