const prisma = require('../utils/prisma');
const fs = require('fs');
const path = require('path');

const deleteLocalImage = (imageUrl) => {
  if (!imageUrl) return;
  try {
    const filename = imageUrl.split('/uploads/')[1];
    if (filename) {
      const filepath = path.join(__dirname, '../public/uploads', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
  } catch (err) {
    console.error('Failed to delete local image:', err.message);
  }
};

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const where = {};
    if (category) where.categoryId = parseInt(category);
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }
    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        inventories: { select: { id: true, quantity: true, warehouseId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, sku, barcode, description, price, tax, categoryId, status } = req.body;
    if (!name || !sku || !price || !categoryId) {
      return res.status(400).json({ message: 'Name, SKU, price, and category are required' });
    }

    let images = req.body.images || [];
    if (typeof images === 'string') images = [images];
    let imageUrl = images.length > 0 ? images[0] : null;

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        barcode: barcode || null,
        description,
        price: parseFloat(price),
        tax: parseFloat(tax || 0),
        imageUrl,
        images,
        status: status || 'active',
        categoryId: parseInt(categoryId),
      },
      include: { category: true },
    });
    res.status(201).json(product);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'SKU or barcode already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, sku, barcode, description, price, tax, categoryId, status } = req.body;
    const existing = await prisma.product.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    let images = req.body.images || existing.images || [];
    if (typeof images === 'string') images = [images];
    let imageUrl = images.length > 0 ? images[0] : existing.imageUrl;

    const updated = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name: name || existing.name,
        sku: sku || existing.sku,
        barcode: barcode !== undefined ? barcode : existing.barcode,
        description: description !== undefined ? description : existing.description,
        price: price ? parseFloat(price) : existing.price,
        tax: tax !== undefined ? parseFloat(tax) : existing.tax,
        imageUrl,
        images,
        status: status || existing.status,
        categoryId: categoryId ? parseInt(categoryId) : existing.categoryId,
      },
      include: { category: true },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existing) return res.status(404).json({ message: 'Product not found' });
    if (existing.images && existing.images.length > 0) {
      existing.images.forEach(deleteLocalImage);
    } else {
      deleteLocalImage(existing.imageUrl);
    }
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/products/generate-description
const generateDescription = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) return res.status(400).json({ message: 'Name and category are required' });
    
    const { generateProductDescription } = require('../services/aiService');
    const description = await generateProductDescription(name, category);
    res.json({ description });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  generateDescription,
};
