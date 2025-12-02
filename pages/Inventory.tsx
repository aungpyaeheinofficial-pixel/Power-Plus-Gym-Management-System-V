

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Camera, Edit, Trash2, Package, Image as ImageIcon, X, Check, Filter, LayoutGrid, List, AlertTriangle, FolderCog, FolderOpen } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { getSafeImageSrc, handleImageError } from '../utils/imageUtils';

export const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, productCategories, addProductCategory, updateProductCategory, deleteProductCategory } = useApp();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Category Management State
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  
  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  
  // Form State
  const initialFormState: Partial<Product> = {
    nameMM: '',
    nameEN: '',
    categoryId: '',
    stock: 0,
    price: 0,
    image: '',
    isActive: true,
    lowStockThreshold: 10,
    unit: 'pcs'
  };
  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);

  // Category Form State
  const initialCategoryForm: Partial<ProductCategory> = {
      nameEN: '',
      nameMM: '',
      icon: '📦'
  };
  const [categoryFormData, setCategoryFormData] = useState<Partial<ProductCategory>>(initialCategoryForm);

  // File Refs
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [targetProductId, setTargetProductId] = useState<string | null>(null);

  // Handlers - Card Photo Upload
  const handleCardPhotoClick = (id: string) => {
    setTargetProductId(id);
    cardFileInputRef.current?.click();
  };

  const handleCardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetProductId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProduct(targetProductId, { image: reader.result as string });
        setTargetProductId(null);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input
  };

  // Handlers - Modal Photo Upload
  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handlers - Product CRUD
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      updateProduct(formData.id, formData);
    } else {
      addProduct({
        ...formData as Product,
        id: Date.now().toString(),
        // Fallback if nameEN isn't used in form but required by type
        nameEN: formData.nameEN || formData.nameMM || 'Product' 
      });
    }
    closeModal();
  };

  const confirmDelete = () => {
      if (deleteId) {
          deleteProduct(deleteId);
          setDeleteId(null);
      }
  };

  const openAddModal = () => {
    setFormData({
        ...initialFormState,
        categoryId: productCategories[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setFormData(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  // Handlers - Category CRUD
  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (e.target.value === 'NEW') {
          openCategoryForm(null);
          // Keep previous value temporarily until new one is added
          return;
      }
      setFormData({ ...formData, categoryId: e.target.value });
  };

  const openCategoryForm = (category: ProductCategory | null) => {
      if (category) {
          setEditingCategory(category);
          setCategoryFormData(category);
      } else {
          setEditingCategory(null);
          setCategoryFormData(initialCategoryForm);
      }
      setIsCategoryFormOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingCategory) {
          updateProductCategory(editingCategory.id, categoryFormData);
      } else {
          const newId = Date.now().toString();
          addProductCategory({
              ...categoryFormData as ProductCategory,
              id: newId
          });
          // If called from product form (modal open), auto-select new category
          if (isModalOpen) {
              setFormData(prev => ({ ...prev, categoryId: newId }));
              // Keep manager open if it was open, else close category form only
              if (!isCategoryManagerOpen) setIsCategoryFormOpen(false);
          }
      }
      setIsCategoryFormOpen(false);
      setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
      const count = products.filter(p => p.categoryId === id).length;
      if (count > 0) {
          alert(`Cannot delete category. It contains ${count} products.`);
          return;
      }
      setDeleteCategoryId(id);
  };

  const confirmDeleteCategory = () => {
      if (deleteCategoryId) {
          deleteProductCategory(deleteCategoryId);
          setDeleteCategoryId(null);
      }
  };

  // Helper - Stock Badge
  const getStockStatus = (qty: number) => {
    if (qty === 0) return { label: 'Out of Stock', color: 'bg-red-500', text: 'text-white' };
    if (qty <= 10) return { label: 'Low Stock', color: 'bg-yellow-500', text: 'text-black' };
    return { label: 'In Stock', color: 'bg-green-500', text: 'text-white' };
  };

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nameMM.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.nameEN.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const ICONS = ['📦', '🏋️', '👕', '🎒', '🥤', '💊', '🧤', '👟', '🧴', '🍎', '🧘', '🚲'];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Hidden Input for Card Photo Updates */}
      <input 
        type="file" 
        accept="image/*" 
        ref={cardFileInputRef} 
        className="hidden" 
        onChange={handleCardFileChange} 
      />

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search products..."
            className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto items-center flex-wrap md:flex-nowrap">
             {/* Category Manager Button */}
             <button 
                onClick={() => setIsCategoryManagerOpen(true)}
                className="bg-dark-900 border border-white/10 hover:bg-white/5 text-gray-300 px-3 py-3 rounded-xl flex items-center gap-2 transition-colors"
                title="Manage Categories"
             >
                <FolderCog size={20} />
                <span className="hidden xl:inline text-sm font-bold">Categories</span>
             </button>

             <div className="bg-dark-900 border border-white/10 rounded-xl px-2 flex items-center flex-1 md:flex-none">
                <Filter size={16} className="text-gray-500 ml-2" />
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent text-white text-sm font-medium py-3 pl-2 pr-8 outline-none cursor-pointer w-full"
                >
                    <option value="All" className="bg-dark-900 text-white">All Categories</option>
                    {productCategories.map(c => (
                        <option key={c.id} value={c.id} className="bg-dark-900 text-white">{c.nameMM || c.nameEN}</option>
                    ))}
                </select>
             </div>

             {/* View Toggle */}
            <div className="flex bg-dark-900 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                title="List View"
              >
                <List size={20} />
              </button>
            </div>

            <button 
              onClick={openAddModal}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Plus size={20} />
              <span className="font-sans">အသစ်ထည့်မည်</span>
            </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
        {viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product.stock);
              const categoryName = productCategories.find(c => c.id === product.categoryId)?.nameMM || 'General';

              return (
                <div key={product.id} className="glass-panel rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 group flex flex-col relative">
                  {/* Photo Area */}
                  <div className="aspect-square bg-dark-900 relative">
                    {getSafeImageSrc(product.image) ? (
                      <img 
                        src={getSafeImageSrc(product.image)} 
                        alt={product.nameMM} 
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-white/5">
                        <Package size={48} className="mb-2 opacity-50" />
                        <span className="text-xs">No Photo</span>
                      </div>
                    )}
                    
                    {/* Delete Button - Top Right */}
                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                             onClick={(e) => { e.stopPropagation(); setDeleteId(product.id); }}
                             className="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                             title="Delete Product"
                         >
                             <Trash2 size={16} />
                         </button>
                    </div>

                    {/* Stock Badge Overlay */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold uppercase ${stockStatus.color} ${stockStatus.text}`}>
                      {stockStatus.label}
                    </div>

                    {/* Camera Button Overlay */}
                    <button 
                      onClick={() => handleCardPhotoClick(product.id)}
                      className="absolute bottom-3 right-3 p-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 transition-colors hover:scale-110 active:scale-95"
                      title="Change Photo"
                    >
                      <Camera size={18} />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="mb-1">
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        {categoryName}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-white mb-2 line-clamp-1" title={product.nameMM || product.nameEN}>
                      {product.nameMM || product.nameEN}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                        <div className="text-gray-500 text-[10px]">အရေအတွက်</div>
                        <div className="font-bold text-white">{product.stock}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                        <div className="text-gray-500 text-[10px]">စျေးနှုန်း</div>
                        <div className="font-bold text-gold-500">{product.price.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-white/5">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="w-full py-2 rounded-lg bg-white/5 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 border border-white/5 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
                      >
                        <Edit size={14} /> Edit Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-dark-900/50 border border-white/5 rounded-2xl overflow-hidden animate-fade-in">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="p-4">Product</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Quantity</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {filteredProducts.map(product => {
                            const stockStatus = getStockStatus(product.stock);
                            const categoryName = productCategories.find(c => c.id === product.categoryId)?.nameMM || 'General';

                            return (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative group/photo cursor-pointer flex-shrink-0" onClick={() => handleCardPhotoClick(product.id)}>
                                                <div className="w-12 h-12 rounded-lg bg-dark-950 border border-white/10 overflow-hidden">
                                                    {getSafeImageSrc(product.image) ? (
                                                        <img 
                                                            src={getSafeImageSrc(product.image)} 
                                                            className="w-full h-full object-cover"
                                                            onError={handleImageError}
                                                            alt={product.nameEN}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500"><Package size={20}/></div>
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                                                    <Camera size={14} className="text-white"/>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-base">{product.nameMM || product.nameEN}</div>
                                                <div className="text-xs text-gray-500">{product.nameEN}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
                                            {categoryName}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-white">{product.stock}</td>
                                    <td className="p-4 font-mono text-gold-500 font-bold">{product.price.toLocaleString()} Ks</td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${stockStatus.color.replace('bg-', 'bg-opacity-10 text-').replace('text-white', '').replace('text-black', '')} ${stockStatus.color.includes('green') ? 'text-green-500' : stockStatus.color.includes('yellow') ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {stockStatus.label}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(product)} className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors border border-transparent hover:border-blue-500/30">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => setDeleteId(product.id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/30">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
             </div>
          </div>
        )}
      </div>

      {/* --- CATEGORY MANAGER MODAL --- */}
      {isCategoryManagerOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-dark-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden animate-slide-up flex flex-col max-h-[80vh]">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                      <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><FolderCog size={24} /></div>
                          <div>
                              <h2 className="text-xl font-bold text-white">Category Management</h2>
                              <p className="text-sm text-gray-400">Manage product categories</p>
                          </div>
                      </div>
                      <button onClick={() => setIsCategoryManagerOpen(false)} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                      <button 
                          onClick={() => openCategoryForm(null)}
                          className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/5 transition-all mb-6 group"
                      >
                          <Plus size={20} className="group-hover:scale-110 transition-transform"/>
                          <span className="font-bold">Add New Category</span>
                      </button>

                      <div className="space-y-3">
                          {productCategories.map(cat => {
                              const count = products.filter(p => p.categoryId === cat.id).length;
                              return (
                                  <div key={cat.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-white/10 transition-colors group">
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-lg bg-dark-950 flex items-center justify-center text-2xl border border-white/5">
                                              {cat.icon || '📦'}
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-white text-lg">{cat.nameEN}</h4>
                                              <p className="text-sm text-gray-400">{cat.nameMM}</p>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-6">
                                          <div className="text-right">
                                              <span className="text-white font-bold block">{count}</span>
                                              <span className="text-[10px] text-gray-500 uppercase font-bold">Products</span>
                                          </div>
                                          <div className="flex gap-2">
                                              <button onClick={() => openCategoryForm(cat)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors">
                                                  <Edit size={16} />
                                              </button>
                                              <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                                  <Trash2 size={16} />
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- ADD/EDIT CATEGORY MODAL --- */}
      {isCategoryFormOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-dark-900 border border-white/10 w-full max-w-md rounded-2xl p-6 animate-scale-up shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <FolderOpen className="text-blue-500" />
                      {editingCategory ? 'Edit Category' : 'New Category'}
                  </h3>
                  <form onSubmit={handleSaveCategory} className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Name (English)</label>
                          <input required value={categoryFormData.nameEN} onChange={e => setCategoryFormData({...categoryFormData, nameEN: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="e.g. Supplements" />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Name (Myanmar)</label>
                          <input required value={categoryFormData.nameMM} onChange={e => setCategoryFormData({...categoryFormData, nameMM: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-sans" placeholder="e.g. ဖြည့်စွက်စာ" />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Icon</label>
                          <div className="flex gap-2 flex-wrap bg-dark-950 p-3 rounded-xl border border-white/10">
                              {ICONS.map(icon => (
                                  <button 
                                      key={icon}
                                      type="button"
                                      onClick={() => setCategoryFormData({...categoryFormData, icon})}
                                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${categoryFormData.icon === icon ? 'bg-blue-500 text-white scale-110 shadow-lg' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
                                  >
                                      {icon}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="flex gap-3 mt-8">
                          <button type="button" onClick={() => setIsCategoryFormOpen(false)} className="flex-1 py-3 rounded-xl text-gray-400 hover:bg-white/5 font-bold transition-colors">Cancel</button>
                          <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all">Save Changes</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Delete Category Confirmation */}
      {deleteCategoryId && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center animate-scale-up">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                      <AlertTriangle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Delete Category?</h3>
                  <p className="text-gray-400 text-sm mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
                  <div className="flex gap-3">
                      <button onClick={() => setDeleteCategoryId(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold">Cancel</button>
                      <button onClick={confirmDeleteCategory} className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold shadow-lg shadow-red-500/20">Delete</button>
                  </div>
              </div>
          </div>
      )}


      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-dark-900 border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white font-sans">
                {formData.id ? 'ပစ္စည်းပြင်ဆင်ရန်' : 'ပစ္စည်းအသစ်ထည့်ရန်'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Photo Upload Area */}
              <div 
                onClick={() => modalFileInputRef.current?.click()}
                className={`relative w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
                  formData.image 
                  ? 'border-blue-500 bg-dark-950' 
                  : 'border-white/20 hover:border-blue-500 bg-white/5 hover:bg-white/10'
                }`}
              >
                {getSafeImageSrc(formData.image) ? (
                  <>
                    <img 
                      src={getSafeImageSrc(formData.image)} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
                        <Camera size={18} />
                        Change Photo
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-500">
                      <ImageIcon size={32} />
                    </div>
                    <p className="font-bold text-sm">Click to upload photo</p>
                    <p className="text-xs opacity-50 mt-1">Supports JPG, PNG</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={modalFileInputRef} 
                  className="hidden" 
                  onChange={handleModalFileChange} 
                />
              </div>

              {/* Text Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block font-sans">ပစ္စည်းအမည်</label>
                  <input 
                    required 
                    value={formData.nameMM} 
                    onChange={e => setFormData({...formData, nameMM: e.target.value})} 
                    className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none font-sans" 
                    placeholder="ဥပမာ - ဝေပရိုတိန်း" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block font-sans">အမျိုးအစား</label>
                      <select 
                        value={formData.categoryId} 
                        onChange={handleCategorySelectChange}
                        className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none font-sans appearance-none"
                      >
                         {productCategories.map(c => (
                             <option key={c.id} value={c.id}>{c.nameMM || c.nameEN}</option>
                         ))}
                         <option disabled>──────────</option>
                         <option value="NEW" className="text-blue-400 font-bold">+ Create New Category</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block font-sans">စျေးနှုန်း (Ks)</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                        className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none font-mono" 
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block font-sans">အရေအတွက်</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.stock} 
                        onChange={e => setFormData({...formData, stock: Number(e.target.value)})} 
                        className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none font-mono" 
                      />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block font-sans">သတိပေးချက်</label>
                      <input 
                        type="number" 
                        value={formData.lowStockThreshold} 
                        onChange={e => setFormData({...formData, lowStockThreshold: Number(e.target.value)})} 
                        className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none font-mono" 
                        placeholder="Low Stock Limit"
                      />
                   </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button onClick={closeModal} className="px-6 py-3 rounded-xl hover:bg-white/10 text-white transition-colors font-medium">
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all transform active:scale-95 shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <Check size={18} />
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center animate-scale-up">
             <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                 <AlertTriangle size={32} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Delete Product?</h3>
             {(() => {
                const p = products.find(prod => prod.id === deleteId);
                return (
                    <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/5 text-left">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-1">Product</p>
                        <p className="text-white font-bold mb-2">{p?.nameEN}</p>
                        <p className="text-gray-400 text-xs uppercase font-bold mb-1">Category</p>
                        <p className="text-blue-400 text-sm">{productCategories.find(c => c.id === p?.categoryId)?.nameEN}</p>
                    </div>
                );
             })()}
             <p className="text-gray-400 text-sm mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
             <div className="flex gap-3">
                 <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold">Cancel</button>
                 <button 
                    onClick={confirmDelete} 
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold shadow-lg shadow-red-500/20"
                 >
                   Delete
                 </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};