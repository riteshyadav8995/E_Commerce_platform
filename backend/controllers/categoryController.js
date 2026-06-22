const prisma = require('../utils/prisma');
const cloudinary = require('../utils/cloudinary');

const streamUpload = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_API_KEY) {
      console.warn('Cloudinary not configured. Skipping image upload.');
      return resolve(null);
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const parts = imageUrl.split('/');
    const folderAndFile = parts.slice(-2).join('/');
    const publicId = folderAndFile.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { products: true },
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    let imageUrl = null;
    if (req.file) {
      imageUrl = await streamUpload(req.file.buffer, 'ecommerce/categories');
    }

    const category = await prisma.category.create({
      data: { name, description, image: imageUrl },
    });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await prisma.category.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!existing) return res.status(404).json({ message: 'Category not found' });

    let imageUrl = existing.image;
    if (req.file) {
      await deleteFromCloudinary(existing.image);
      imageUrl = await streamUpload(req.file.buffer, 'ecommerce/categories');
    }

    const updated = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description, image: imageUrl },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const existing = await prisma.category.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    if (!existing) return res.status(404).json({ message: 'Category not found' });

    if (existing._count.products > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category because it has ${existing._count.products} product(s). Please delete or reassign them first.` 
      });
    }

    await deleteFromCloudinary(existing.image);
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
