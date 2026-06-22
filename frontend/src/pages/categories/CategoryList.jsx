import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, deleteCategory } from '../../services/categoryService';
import { Plus, Edit, Trash2, Tag, Package, AlertCircle } from 'lucide-react';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? All associated products will lose their category.`)) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{categories.length} total categories</p>
        </div>
        <Link
          to="/categories/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Link>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 transition-colors">
          <Tag className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No categories yet.</p>
          <Link to="/categories/new" className="mt-3 inline-block text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Create your first category
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <Tag className="h-12 w-12 text-blue-300 dark:text-gray-500" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{cat.name}</h3>
                {cat.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{cat.description}</p>}
                <div className="flex items-center mt-2 text-xs text-gray-400 dark:text-gray-500">
                  <Package className="h-3.5 w-3.5 mr-1" />
                  {cat._count?.products ?? 0} products
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/categories/${cat.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
