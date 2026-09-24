const Category = require("../models/Category");

const defaultCategories = [
  { name: "Food", icon: "🍔", type: "expense" },
  { name: "Transport", icon: "🚗", type: "expense" },
  { name: "Shopping", icon: "🛍️", type: "expense" },
  { name: "Bills", icon: "🧾", type: "expense" },
  { name: "Entertainment", icon: "🎬", type: "expense" },
  { name: "Salary", icon: "💼", type: "income" },
  { name: "Freelance", icon: "💻", type: "income" },
  { name: "Other Income", icon: "💰", type: "income" },
];

const ensureDefaultCategories = async (userId) => {
  const hasCategories = await Category.exists({
    user_id: userId,
    active: true,
  });

  if (!hasCategories) {
    await Category.insertMany(
      defaultCategories.map((category) => ({
        ...category,
        user_id: userId,
      }))
    );
  }
};

// GET CATEGORIES
const getCategories = async (req, res) => {
  try {

    await ensureDefaultCategories(req.user._id);

    const categories =
      await Category.find({
        active: true,

        $or: [
          { user_id: null },
          { user_id: req.user._id },
        ],
      }).sort({
        name: 1,
      });


    res.json({
      categories,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {

    const {
      name,
      icon,
      color,
      type,
    } = req.body;


    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }


    const category = await Category.create({
      user_id: req.user._id,
      name,
      icon,
      color,
      type: type || "expense",
    });


    res.status(201).json({
      message: "Category created",
      category,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


module.exports = {
  getCategories,
  createCategory,
};