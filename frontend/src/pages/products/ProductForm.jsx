import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProductById, createProduct, updateProduct, generateDescription } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { ArrowLeft, Save, Image as ImageIcon, Sparkles } from 'lucide-react';

const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [serverError, setServerError] = useState('');
  const [imageUrls, setImageUrls] = useState(['']);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    const name = getValues('name');
    const categoryId = getValues('categoryId');
    if (!name || !categoryId) {
      alert("Please enter a product name and select a category first.");
      return;
    }
    const categoryName = categories.find(c => c.id == categoryId)?.name;
    
    setIsGenerating(true);
    try {
      const res = await generateDescription(name, categoryName);
      setValue('description', res.data.description);
    } catch (err) {
      alert("Failed to generate description");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const catRes = await getCategories();
        setCategories(catRes.data);

        if (isEditMode) {
          const res = await getProductById(id);
          const p = res.data;
          setValue('name', p.name);
          setValue('sku', p.sku);
          setValue('barcode', p.barcode || '');
          setValue('description', p.description || '');
          setValue('price', p.price);
          setValue('tax', p.tax);
          setValue('categoryId', p.categoryId);
          setValue('status', p.status);
          if (p.images && p.images.length > 0) {
            setImageUrls(p.images);
          } else if (p.imageUrl) {
            setImageUrls([p.imageUrl]);
          }
        }
      } catch (err) {
        setServerError('Failed to load data');
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id, isEditMode, setValue]);

  const handleUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleAddUrl = () => {
    if (imageUrls.length < 5) {
      setImageUrls([...imageUrls, '']);
    }
  };

  const handleRemoveUrl = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    if (newUrls.length === 0) newUrls.push('');
    setImageUrls(newUrls);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    
    const validUrls = imageUrls.filter(url => url.trim() !== '');
    const payload = { ...data, images: validUrls };

    try {
      if (isEditMode) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/products');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center mb-6">
        <Link to="/products" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Product' : 'Add Product'}
        </h1>
      </div>

      {serverError && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-6 md:col-span-1">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name *</label>
              <input {...register('name', { required: 'Required' })} type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU *</label>
                <input {...register('sku', { required: 'Required' })} type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Barcode</label>
                <input {...register('barcode')} type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₹) *</label>
                <input {...register('price', { required: 'Required' })} type="number" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tax (%)</label>
                <input {...register('tax')} type="number" step="0.01" defaultValue="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select {...register('categoryId', { required: 'Required' })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select {...register('status')} defaultValue="active" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6 md:col-span-1">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="text-xs flex items-center font-medium text-purple-600 hover:text-purple-800 disabled:opacity-50">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              <textarea {...register('description')} rows="5" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image URLs (up to 5)</label>
              <div className="space-y-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input 
                      type="text" 
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveUrl(index)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {imageUrls.length < 5 && (
                  <button 
                    type="button" 
                    onClick={handleAddUrl}
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                  >
                    + Add More URL
                  </button>
                )}
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Image Previews</p>
                <div className="grid grid-cols-3 gap-2">
                  {imageUrls.filter(u => u.trim() !== '').map((src, idx) => (
                    <div key={idx} className="relative aspect-square bg-gray-50 border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                      <img src={src} alt="Preview" className="max-h-full max-w-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  ))}
                  {imageUrls.filter(u => u.trim() !== '').length === 0 && (
                     <div className="col-span-3 text-center p-4 text-gray-400 text-xs border border-dashed rounded">No images to preview</div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Link to="/products" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Product</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
