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

import { CategoryDeleteModal } from './CategoryDeleteModal';
import { CategoryModal } from './CategoryModal';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  type CategoryPayload,
  updateCategory,
} from '../../services/categories';
import { colors } from '../../theme/colors';
import type { Category } from '../../types/pos';

const categoriesQueryKey = ['categories'];
const pageSize = 10;

export function CategoriesScreen() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
  });

  const saveCategoryMutation = useMutation({
    mutationFn: (payload: CategoryPayload) =>
      selectedCategory
        ? updateCategory(selectedCategory.id, payload)
        : createCategory(payload),
    onSuccess: async () => {
      const action = selectedCategory ? 'diperbarui' : 'ditambahkan';
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      closeModal();
      Toast.show({
        type: 'success',
        text1: `Kategori berhasil ${action}.`,
      });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Kategori gagal disimpan.',
        text2: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      setDeleteTarget(null);
      Toast.show({
        type: 'success',
        text1: 'Kategori berhasil dihapus.',
      });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Kategori gagal dihapus.',
        text2: error instanceof Error ? error.message : undefined,
      });
    },
  });

  function openCreateModal() {
    setSelectedCategory(null);
    setIsModalVisible(true);
  }

  function openEditModal(category: Category) {
    setSelectedCategory(category);
    setIsModalVisible(true);
  }

  function closeModal() {
    setSelectedCategory(null);
    setIsModalVisible(false);
  }

  function handleDelete(category: Category) {
    setDeleteTarget(category);
  }

  function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    deleteCategoryMutation.mutate(deleteTarget.id);
  }

  const categories = categoriesQuery.data ?? [];
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredCategories = useMemo(
    () =>
      normalizedSearch
        ? categories.filter((category) =>
            [category.name, category.description]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(normalizedSearch),
          )
        : categories,
    [categories, normalizedSearch],
  );
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const [currentPage, setCurrentPage] = useState(1);
  const pageStartIndex = (currentPage - 1) * pageSize;
  const paginatedCategories = filteredCategories.slice(pageStartIndex, pageStartIndex + pageSize);

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
          <Text style={styles.sectionTitle}>Kategori</Text>
          <Text style={styles.sectionMeta}>
            {filteredCategories.length} dari {categories.length} kategori
          </Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={openCreateModal}>
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
          placeholder="Cari kategori atau deskripsi"
          placeholderTextColor={colors.placeholder}
          style={styles.searchInput}
          value={searchQuery}
        />
        {searchQuery ? (
          <Pressable
            accessibilityLabel="Bersihkan pencarian"
            hitSlop={8}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons color={colors.secondaryText} name="close-circle-outline" size={20} />
          </Pressable>
        ) : null}
      </View>

      {categoriesQuery.isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateCopy}>Memuat kategori...</Text>
        </View>
      ) : null}

      {categoriesQuery.isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Kategori gagal dimuat</Text>
          <Text style={styles.stateCopy}>
            {categoriesQuery.error instanceof Error
              ? categoriesQuery.error.message
              : 'Coba muat ulang halaman.'}
          </Text>
        </View>
      ) : null}

      {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Belum ada kategori</Text>
          <Text style={styles.stateCopy}>Tambah kategori pertama untuk mengelompokkan produk.</Text>
        </View>
      ) : null}

      {!categoriesQuery.isLoading &&
      !categoriesQuery.isError &&
      categories.length > 0 &&
      filteredCategories.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Kategori tidak ditemukan</Text>
          <Text style={styles.stateCopy}>Coba gunakan kata kunci pencarian lain.</Text>
        </View>
      ) : null}

      {filteredCategories.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableHeadText, styles.numberCell]}>No</Text>
              <Text style={[styles.tableHeadText, styles.nameCell]}>Kategori</Text>
              <Text style={[styles.tableHeadText, styles.descriptionCell]}>Deskripsi</Text>
              <Text style={[styles.tableHeadText, styles.actionCell]}>Aksi</Text>
            </View>

            {paginatedCategories.map((category, index) => (
              <View key={category.id} style={styles.tableRow}>
                <Text style={[styles.tableText, styles.numberCell]}>{pageStartIndex + index + 1}</Text>
                <Text style={[styles.tableValue, styles.nameCell]} numberOfLines={1}>
                  {category.name}
                </Text>
                <Text style={[styles.tableText, styles.descriptionCell]} numberOfLines={1}>
                  {category.description?.trim() || 'Tanpa deskripsi'}
                </Text>
                <View style={[styles.rowActions, styles.actionCell]}>
                  <Pressable style={styles.iconButton} onPress={() => openEditModal(category)}>
                    <Ionicons color={colors.strongMuted} name="create-outline" size={19} />
                  </Pressable>
                  <Pressable
                    disabled={deleteCategoryMutation.isPending}
                    style={[styles.iconButton, styles.dangerButton]}
                    onPress={() => handleDelete(category)}
                  >
                    <Ionicons color={colors.danger} name="trash-outline" size={19} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {filteredCategories.length > 0 ? (
        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            Menampilkan {pageStartIndex + 1}-
            {Math.min(pageStartIndex + pageSize, filteredCategories.length)} dari{' '}
            {filteredCategories.length}
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

      <CategoryModal
        category={selectedCategory}
        isSaving={saveCategoryMutation.isPending}
        visible={isModalVisible}
        onClose={closeModal}
        onSubmit={(payload) => saveCategoryMutation.mutate(payload)}
      />
      <CategoryDeleteModal
        category={deleteTarget}
        isDeleting={deleteCategoryMutation.isPending}
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
    width: '100%'
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
    width: '100%',
    minWidth: 680,
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
    borderColor: colors.border,
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
    color: colors.text,
    fontWeight: '900',
  },
  numberCell: {
    width: 62,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  nameCell: {
    flex: 1,
    minWidth: 190,
    paddingHorizontal: 14,
  },
  descriptionCell: {
    flex: 1.8,
    minWidth: 300,
    paddingHorizontal: 12,
  },
  actionCell: {
    flex: 0.65,
    minWidth: 108,
    paddingHorizontal: 12,
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
