

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, MOCK_MEMBERSHIP_TYPES } from '../constants';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Search, ScanLine, Tag, Receipt, Package, X, ChevronRight } from 'lucide-react';
import { Product, Transaction, TransactionItem, MembershipType } from '../types';
import { getSafeImageSrc, handleImageError } from '../utils/imageUtils';

export const POS: React.FC = () => {
  const { products, productCategories, addTransaction, members, language } = useApp();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'Products' | 'Membership'>('Products');
  const [cart, setCart] = useState<{item: Product | MembershipType, quantity: number, type: 'Product' | 'Membership'}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('Cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  
  // Membership specific state
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const filteredProducts = products.filter(p => 
      (selectedCategory === 'All' || p.categoryId === selectedCategory) &&
      (p.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) || p.nameMM.includes(searchQuery))
  );

  const addToCart = (item: Product | MembershipType, type: 'Product' | 'Membership') => {
    setCart(prev => {
      // For membership, we only allow 1 qty per type usually, but simplified here
      const existing = prev.find(i => i.item.id === item.id && i.type === type);
      if (existing) {
        return prev.map(i => (i.item.id === item.id && i.type === type) ? {...i, quantity: i.quantity + 1} : i);
      }
      return [...prev, { item, quantity: 1, type }];
    });
    // Auto-show cart when item is added
    setShowCart(true);
  };

  const removeFromCart = (id: string, type: 'Product' | 'Membership') => {
    setCart(prev => prev.filter(i => !(i.item.id === id && i.type === type)));
  };

  const updateQuantity = (id: string, type: 'Product' | 'Membership', delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.item.id === id && i.type === type) {
        return { ...i, quantity: Math.max(1, i.quantity + delta) };
      }
      return i;
    }));
  };

  const subtotal = cart.reduce((sum, line) => {
      const price = 'price' in line.item ? line.item.price : 0;
      return sum + (price * line.quantity);
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Map cart to transaction items
    const items: TransactionItem[] = cart.map(c => ({
        name: 'nameEN' in c.item ? c.item.nameEN : '',
        quantity: c.quantity,
        price: c.item.price,
        type: c.type
    }));

    const transaction: Transaction = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      type: cart.some(c => c.type === 'Membership') ? (cart.some(c => c.type === 'Product') ? 'Mixed' : 'Membership') : 'Product',
      items: items,
      subtotal: subtotal,
      discount: 0,
      total: subtotal,
      paymentMethod,
      date: new Date().toISOString(),
      processedBy: 'Admin', // In real app use user.username
      memberId: selectedMemberId
    };

    addTransaction(transaction);
    setShowReceipt(true);
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setCart([]);
    setSelectedMemberId('');
    setShowCart(false);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 overflow-y-auto lg:overflow-hidden relative">
      {/* Left Side - Catalog */}
      <div className="flex-1 flex flex-col min-h-0 bg-dark-900/50 backdrop-blur border border-white/5 rounded-2xl overflow-visible lg:overflow-hidden">
        {/* Top Bar - Fixed on mobile, sticky on desktop */}
        <div className="fixed top-20 left-0 right-0 lg:relative lg:top-0 bg-dark-900 backdrop-blur-md p-3 sm:p-4 border-b-2 border-gold-500/30 space-y-3 sm:space-y-4 shadow-2xl z-50 lg:sticky lg:z-50">
            <div className="flex gap-2 sm:gap-4">
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab('Products');
                    }}
                    className={`flex-1 py-3 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-sm sm:text-base transition-all touch-manipulation active:scale-95 ${activeTab === 'Products' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/30 ring-2 ring-gold-500/50' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'}`}
                >
                    <span className="flex items-center justify-center gap-2">
                        <Package size={16} className="sm:hidden" />
                        Products
                    </span>
                </button>
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab('Membership');
                    }}
                    className={`flex-1 py-3 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-sm sm:text-base transition-all touch-manipulation active:scale-95 ${activeTab === 'Membership' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/30 ring-2 ring-gold-500/50' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'}`}
                >
                    <span className="flex items-center justify-center gap-2">
                        <Tag size={16} className="sm:hidden" />
                        Membership
                    </span>
                </button>
            </div>

            {activeTab === 'Products' && (
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            className="w-full bg-dark-950 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:border-gold-500 outline-none"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="bg-white/5 p-2 rounded-xl text-gray-400 hover:text-white"><ScanLine size={20}/></button>
                </div>
            )}
        </div>

        {/* Content - Add padding top on mobile to account for fixed tabs */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0 pt-32 lg:pt-4" style={{ minHeight: '400px' }}>
            {activeTab === 'Products' ? (
                <>
                    {/* Categories */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${selectedCategory === 'All' ? 'bg-white/20 text-white border border-white/10' : 'bg-white/5 text-gray-400 border border-transparent'}`}
                        >
                            All Items
                        </button>
                        {productCategories.map(cat => (
                            <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'bg-white/20 text-white border border-white/10' : 'bg-white/5 text-gray-400 border border-transparent'}`}
                            >
                            {cat.nameEN}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <div key={product.id} onClick={() => addToCart(product, 'Product')} className="glass-panel p-3 rounded-xl cursor-pointer hover:border-gold-500/50 transition-all active:scale-95 group relative overflow-hidden">
                                <div className="aspect-square rounded-lg mb-3 overflow-hidden bg-black relative">
                                    {getSafeImageSrc(product.image) ? (
                                        <img 
                                            src={getSafeImageSrc(product.image)} 
                                            alt={product.nameEN} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={handleImageError}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                            <Package size={32} className="text-gray-500" />
                                        </div>
                                    )}
                                    {product.stock <= product.lowStockThreshold && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Low Stock</div>
                                    )}
                                </div>
                                <h4 className="font-bold text-white text-sm truncate">{product.nameEN}</h4>
                                <p className="text-xs text-gray-500 mb-2 truncate">{product.nameMM}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-gold-500 font-bold">{product.price.toLocaleString()} K</span>
                                    <span className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">{product.stock} left</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="col-span-full mb-4">
                         <label className="block text-sm text-gray-400 mb-2">Select Member (Optional)</label>
                         <select 
                            className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none"
                            value={selectedMemberId}
                            onChange={e => setSelectedMemberId(e.target.value)}
                         >
                             <option value="">Guest / Walk-in</option>
                             {members.map(m => (
                                 <option key={m.id} value={m.id}>{m.fullNameEN} ({m.memberId})</option>
                             ))}
                         </select>
                     </div>
                     {MOCK_MEMBERSHIP_TYPES.map(type => (
                         <div 
                           key={type.id} 
                           onClick={() => addToCart(type, 'Membership')}
                           className="glass-panel p-6 rounded-2xl cursor-pointer hover:border-gold-500/50 transition-all relative overflow-hidden group"
                         >
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                 <Tag size={60} />
                             </div>
                             <h3 className="text-xl font-bold text-white mb-1">{type.nameEN}</h3>
                             <p className="text-sm text-gray-400 mb-4">{type.nameMM}</p>
                             <div className="text-2xl font-bold text-gold-500">{type.price.toLocaleString()} Ks</div>
                             <p className="text-xs text-gray-500 mt-2">{type.durationDays} Days Duration</p>
                         </div>
                     ))}
                </div>
            )}
        </div>
      </div>

      {/* Right Side - Cart */}
      <div className="w-full lg:w-[400px] glass-panel rounded-2xl flex flex-col h-full border border-white/10 bg-dark-900/80 backdrop-blur-xl mt-24 lg:mt-0">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-gold-500" size={20} />
            <h3 className="font-bold text-white text-lg">Current Order</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">{cartItemCount} Items</span>
            <button
              onClick={() => setShowCart(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-30">
              <ShoppingCart size={64} className="mb-4" />
              <p className="font-medium">Cart is empty</p>
              <p className="text-sm">Scan product or select item</p>
            </div>
          ) : (
            cart.map((line, idx) => {
              const name = 'nameEN' in line.item ? line.item.nameEN : '';
              const price = line.item.price;
              const img = 'image' in line.item ? line.item.image : null;

              return (
                <div key={`${line.item.id}-${idx}`} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl animate-slide-in-right group border border-transparent hover:border-white/10 transition-colors">
                  {img ? (
                      <img src={img} className="w-12 h-12 rounded-lg bg-black object-cover" />
                  ) : (
                      <div className="w-12 h-12 rounded-lg bg-gold-500/20 flex items-center justify-center text-gold-500">
                          <Tag size={20} />
                      </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{name}</p>
                    <p className="text-xs text-gold-500 font-mono">{(price * line.quantity).toLocaleString()} K</p>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/5">
                    <button onClick={() => updateQuantity(line.item.id, line.type, -1)} className="p-1 hover:text-white text-gray-400 transition-colors"><Minus size={12}/></button>
                    <span className="text-xs w-4 text-center font-bold">{line.quantity}</span>
                    <button onClick={() => updateQuantity(line.item.id, line.type, 1)} className="p-1 hover:text-white text-gray-400 transition-colors"><Plus size={12}/></button>
                  </div>
                  
                  <button onClick={() => removeFromCart(line.item.id, line.type)} className="text-gray-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Totals Section */}
        <div className="p-5 bg-dark-950 border-t border-white/10">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()} Ks</span>
            </div>
            <div className="flex justify-between text-gray-400 text-sm">
                <span>Tax (0%)</span>
                <span>0 Ks</span>
            </div>
            <div className="flex justify-between text-gray-400 text-sm">
                <span>Discount</span>
                <span>0 Ks</span>
            </div>
            <div className="h-px bg-white/10 my-2"></div>
            <div className="flex justify-between text-white font-bold text-xl items-end">
                <span>Total</span>
                <span className="text-gold-500 text-2xl">{subtotal.toLocaleString()} <span className="text-xs text-gray-500 font-normal">Ks</span></span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
             {(['Cash', 'KBZPay', 'WavePay', 'AYA Pay', 'CB Pay', 'Bank Transfer', 'Credit Card'] as const).map(m => (
               <button 
                 key={m} 
                 onClick={() => setPaymentMethod(m)}
                 className={`py-2 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center justify-center gap-1 ${paymentMethod === m ? 'border-gold-500 bg-gold-500 text-black' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                 title={m}
               >
                 <CreditCard size={14} />
                 <span className="truncate w-full text-center">{m.split(' ')[0]}</span>
               </button>
             ))}
          </div>

          <button 
            onClick={handleCheckout} 
            disabled={cart.length === 0}
            className="w-full bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-500 hover:to-gold-700 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2"
          >
            <Banknote size={20} />
            Complete Payment
          </button>
        </div>
      </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white text-black p-0 rounded-2xl w-96 overflow-hidden animate-slide-up relative">
              <div className="bg-gold-500 p-6 text-center">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-gold-500 shadow-xl mb-4">
                    <Receipt size={32} />
                 </div>
                 <h3 className="font-bold text-2xl">Payment Successful!</h3>
                 <p className="text-black/60 text-sm">Thank you for your purchase</p>
              </div>
              
              <div className="p-6 bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
                 <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>Date: {new Date().toLocaleDateString()}</span>
                    <span>Time: {new Date().toLocaleTimeString()}</span>
                 </div>
                 <div className="border-t border-b border-dashed border-gray-300 py-4 space-y-2 mb-4">
                    {cart.map((c, idx) => {
                         const name = 'nameEN' in c.item ? c.item.nameEN : '';
                         return (
                            <div key={idx} className="flex justify-between text-sm">
                                <span>{name} <span className="text-xs text-gray-400">x{c.quantity}</span></span>
                                <span className="font-mono">{('price' in c.item ? c.item.price * c.quantity : 0).toLocaleString()}</span>
                            </div>
                         );
                    })}
                 </div>
                 <div className="flex justify-between font-bold text-xl mb-6">
                    <span>Total Paid ({paymentMethod})</span>
                    <span>{subtotal.toLocaleString()} Ks</span>
                 </div>
                 
                 <div className="space-y-2">
                    <button onClick={closeReceipt} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">Print Receipt</button>
                    <button onClick={closeReceipt} className="w-full text-gray-500 text-sm hover:text-black py-2">Close</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};