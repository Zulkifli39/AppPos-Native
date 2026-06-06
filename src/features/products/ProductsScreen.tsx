import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { ProductDeleteModal } from './ProductDeleteModal';
import { ProductModal } from './ProductModal';
import { fetchCategories } from '../../services/categories';
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  type ProductPayload,
  updateProduct,
} from '../../services/products';
import { colors } from '../../theme/colors';
import type { Product } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';

const productsQueryKey = ['products'];
const categoriesQueryKey = ['categories'];
const pageSize = 10;

export function ProductsScreen() {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const productsQuery = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
  });

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
  });

  const saveProductMutation = useMutation({
    mutationFn: (payload: ProductPayload) =>
      selectedProduct ? updateProduct(selectedProduct.id, payload) : createProduct(payload),
    onSuccess: async () => {
      const action = selectedProduct ? 'diperbarui' : 'ditambahkan';
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      closeModal();
      Toast.show({
        type: 'success',
        text1: `Product berhasil ${action}.`,
      });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Product gagal disimpan.',
        text2: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      setDeleteTarget(null);
      Toast.show({
        type: 'success',
        text1: 'Product berhasil dihapus.',
      });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Product gagal dihapus.',
        text2: error instanceof Error ? error.message : undefined,
      });
    },
  });

  function openCreateModal() {
    setSelectedProduct(null);
    setIsModalVisible(true);
  }

  function openEditModal(product: Product) {
    setSelectedProduct(product);
    setIsModalVisible(true);
  }

  function closeModal() {
    setSelectedProduct(null);
    setIsModalVisible(false);
  }

  function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    deleteProductMutation.mutate(deleteTarget.id);
  }

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredProducts = useMemo(
    () =>
      normalizedSearch
        ? products.filter((product) => {
        const searchableText = [
          product.name,
          product.description,
          product.categoryName,
          product.isBundle ? 'bundle' : 'product',
          `${product.stock}`,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      })
        : products,
    [normalizedSearch, products],
  );
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const pageStartIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(pageStartIndex, pageStartIndex + pageSize);
  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading;
  const isError = productsQuery.isError || categoriesQuery.isError;

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Product</Text>
          <Text style={styles.sectionMeta}>
            {filteredProducts.length} dari {products.length} product
          </Text>
        </View>
        <Pressable
          disabled={categories.length === 0}
          style={[styles.primaryButton, categories.length === 0 && styles.disabledButton]}
          onPress={openCreateModal}
        >
          <Ionicons color={colors.onPrimary} name="add-outline" size={20} />
          <Text style={styles.primaryButtonText}>Tambah</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons color={colors.secondaryText} name="search-outline" size={20} />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setSearchQuery}
          placeholder="Cari product, kategori, tipe, atau stok"
          placeholderTextColor={colors.placeholder}
          style={styles.searchInput}
          value={searchQuery}
        />
        {searchQuery ? (
          <Pressable accessibilityLabel="Bersihkan pencarian" hitSlop={8} onPress={() => setSearchQuery('')}>
            <Ionicons color={colors.secondaryText} name="close-circle-outline" size={20} />
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateCopy}>Memuat product...</Text>
        </View>
      ) : null}

      {isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Product gagal dimuat</Text>
          <Text style={styles.stateCopy}>Coba muat ulang halaman.</Text>
        </View>
      ) : null}

      {!isLoading && !isError && categories.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Kategori belum tersedia</Text>
          <Text style={styles.stateCopy}>Tambahkan kategori terlebih dahulu sebelum membuat product.</Text>
        </View>
      ) : null}

      {!isLoading && !isError && categories.length > 0 && products.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Belum ada product</Text>
          <Text style={styles.stateCopy}>Tambah product pertama untuk mulai mengisi katalog.</Text>
        </View>
      ) : null}

      {!isLoading && !isError && products.length > 0 && filteredProducts.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Product tidak ditemukan</Text>
          <Text style={styles.stateCopy}>Coba gunakan kata kunci pencarian lain.</Text>
        </View>
      ) : null}

      {filteredProducts.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableHeadText, styles.numberCell]}>No</Text>
              <Text style={[styles.tableHeadText, styles.productCell]}>Product</Text>
              <Text style={[styles.tableHeadText, styles.categoryCell]}>Kategori</Text>
              <Text style={[styles.tableHeadText, styles.typeCell]}>Tipe</Text>
              <Text style={[styles.tableHeadText, styles.stockCell]}>Stok</Text>
              <Text style={[styles.tableHeadText, styles.priceCell]}>Modal</Text>
              <Text style={[styles.tableHeadText, styles.priceCell]}>Jual</Text>
              <Text style={[styles.tableHeadText, styles.actionCell]}>Aksi</Text>
            </View>

            {paginatedProducts.map((product, index) => (
              <View key={product.id} style={styles.tableRow}>
                <Text style={[styles.tableText, styles.numberCell]}>{pageStartIndex + index + 1}</Text>
                <View style={styles.productCell}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {product.description?.trim() || 'Tanpa deskripsi'}
                  </Text>
                </View>
                <Text style={[styles.tableText, styles.categoryCell]} numberOfLines={1}>
                  {product.categoryName ?? 'Tanpa kategori'}
                </Text>
                <View style={styles.typeCell}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {product.isBundle ? 'Bundle' : 'Product'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.tableText, styles.stockCell]}>{product.stock}</Text>
                <Text style={[styles.tableText, styles.priceCell]}>
                  {formatCurrency(product.costPrice)}
                </Text>
                <Text style={[styles.tableValue, styles.priceCell]}>
                  {formatCurrency(product.sellingPrice)}
                </Text>
                <View style={[styles.rowActions, styles.actionCell]}>
                  <Pressable style={styles.iconButton} onPress={() => openEditModal(product)}>
                    <Ionicons color={colors.strongMuted} name="create-outline" size={19} />
                  </Pressable>
                  <Pressable
                    disabled={deleteProductMutation.isPending}
                    style={[styles.iconButton, styles.dangerButton]}
                    onPress={() => setDeleteTarget(product)}
                  >
                    <Ionicons color={colors.danger} name="trash-outline" size={19} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {filteredProducts.length > 0 ? (
        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            Menampilkan {pageStartIndex + 1}-{Math.min(pageStartIndex + pageSize, filteredProducts.length)} dari{' '}
            {filteredProducts.length}
          </Text>
          <View style={styles.paginationActions}>
            <Pressable
              disabled={currentPage === 1}
              style={[styles.pageButton, currentPage === 1 && styles.disabledPageButton]}
              onPress={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <Ionicons color={colors.strongMuted} name="chevron-back-outline" size={20} />
            </Pressable>
            <Text style={styles.pageIndicator}>
              {currentPage} / {totalPages}
            </Text>
            <Pressable
              disabled={currentPage === totalPages}
              style={[styles.pageButton, currentPage === totalPages && styles.disabledPageButton]}
              onPress={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              <Ionicons color={colors.strongMuted} name="chevron-forward-outline" size={20} />
            </Pressable>
          </View>
        </View>
      ) : null}

      <ProductModal
        categories={categories}
        isSaving={saveProductMutation.isPending}
        product={selectedProduct}
        visible={isModalVisible}
        onClose={closeModal}
        onSubmit={(payload) => saveProductMutation.mutate(payload)}
      />
      <ProductDeleteModal
        isDeleting={deleteProductMutation.isPending}
        product={deleteTarget}
        visible={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  sectionHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionMeta: {
    color: colors.muted,
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.55,
  },
  searchWrap: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    color: colors.text,
  },
  stateBox: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  stateCopy: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
  table: {
    minWidth: 960,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeader: {
    minHeight: 44,
    backgroundColor: colors.controlLight,
  },
  tableHeadText: {
    color: colors.strongMuted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tableText: {
    color: colors.secondaryText,
    fontWeight: '700',
  },
  tableValue: {
    color: colors.primary,
    fontWeight: '900',
  },
  numberCell: {
    width: 62,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  productCell: {
    width: 250,
    paddingHorizontal: 14,
  },
  categoryCell: {
    width: 150,
    paddingHorizontal: 12,
  },
  typeCell: {
    width: 110,
    paddingHorizontal: 12,
  },
  stockCell: {
    width: 80,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  priceCell: {
    width: 130,
    paddingHorizontal: 12,
    textAlign: 'right',
  },
  actionCell: {
    width: 110,
    paddingHorizontal: 12,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  rowMeta: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 12,
  },
  typeBadge: {
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  typeBadgeText: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '800',
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  dangerButton: {
    backgroundColor: '#fff1f0',
  },
  pagination: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  paginationText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  paginationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  disabledPageButton: {
    opacity: 0.45,
  },
  pageIndicator: {
    minWidth: 54,
    color: colors.strongMuted,
    textAlign: 'center',
    fontWeight: '800',
  },
});
