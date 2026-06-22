import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCategoryById, createCategory, updateCategory } from '../../services/categoryService';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';

const CategoryForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [serverError, setServerError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const loadCategory = async () => {
        try {
          const res = await getCategoryById(id);
          setValue('name', res.data.name);
          setValue('description', res.data.description || '');
          if (res.data.image) {
            setImagePreview(res.data.image);
          }
        } catch (err) {
          setServerError('Failed to load category details');
        } finally {
          setFetching(false);
        }
      };
      loadCategory();
    }
  }, [id, isEditMode, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (isEditMode) {
        await updateCategory(id, formData);
      } else {
        await createCategory(formData);
      }
      navigate('/categories');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center mb-6">
        <Link to="/categories" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Category' : 'Create Category'}
        </h1>
      </div>

      {serverError && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category Name *</label>
          <input
            {...register('name', { required: 'Name is required' })}
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category Image</label>
          <div className="mt-1 flex items-center space-x-4">
            <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span>Upload a file</span>
                <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Link
            to="/categories"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Category</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
