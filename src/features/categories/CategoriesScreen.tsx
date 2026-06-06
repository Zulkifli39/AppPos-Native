import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
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

export function CategoriesScreen() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Kategori</Text>
          <Text style={styles.sectionMeta}>
            {categoriesQuery.data?.length ?? 0} kategori terdaftar
          </Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={openCreateModal}>
          <Ionicons color={colors.onPrimary} name="add-outline" size={20} />
          <Text style={styles.primaryButtonText}>Tambah</Text>
        </Pressable>
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

      {!categoriesQuery.isLoading && !categoriesQuery.isError && categoriesQuery.data?.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Belum ada kategori</Text>
          <Text style={styles.stateCopy}>Tambah kategori pertama untuk mengelompokkan produk.</Text>
        </View>
      ) : null}

      {categoriesQuery.data?.map((category) => (
        <View key={category.id} style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>{category.name}</Text>
            <Text style={styles.rowMeta}>
              {category.description?.trim() || 'Tanpa deskripsi'}
            </Text>
          </View>
          <View style={styles.rowActions}>
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
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  rowMeta: {
    color: colors.muted,
    marginTop: 4,
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
});
