function mapUser(user) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  };
}

function mapCategory(category) {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
  };
}

function mapProduct(product) {
  return {
    id: product.id,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? null,
    name: product.name,
    description: product.description,
    costPrice: Number(product.costPrice),
    sellingPrice: Number(product.sellingPrice),
    imageUrl: product.imageUrl,
    isBundle: product.isBundle,
    stock: product.stock,
  };
}

module.exports = {
  mapCategory,
  mapProduct,
  mapUser,
};
