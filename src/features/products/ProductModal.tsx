import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { ProductPayload } from '../../services/products';
import { colors } from '../../theme/colors';
import type { Category, Product } from '../../types/pos';

type ProductModalProps = {
  categories: Category[];
  isSaving: boolean;
  product?: Product | null;
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: ProductPayload) => void;
};

export function ProductModal({
  categories,
  isSaving,
  product,
  visible,
  onClose,
  onSubmit,
}: ProductModalProps) {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<ProductPayload['imageFile']>(null);
  const [stock, setStock] = useState('');
  const [isBundle, setIsBundle] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setCategoryId(product?.categoryId ?? categories[0]?.id ?? null);
    setName(product?.name ?? '');
    setDescription(product?.description ?? '');
    setCostPrice(product ? `${product.costPrice}` : '');
    setSellingPrice(product ? `${product.sellingPrice}` : '');
    setImageUrl(product?.imageUrl ?? '');
    setImageFile(null);
    setStock(product ? `${product.stock}` : '0');
    setIsBundle(product?.isBundle ?? false);
    setErrorMessage('');
  }, [categories, product, visible]);

  function parseNumber(value: string) {
    return Number(value.replace(',', '.'));
  }

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setErrorMessage('Izin akses galeri diperlukan untuk upload gambar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    setImageFile({
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      uri: asset.uri,
    });
    setImageUrl(asset.uri);
    setErrorMessage('');
  }

  function handleSubmit() {
    const parsedCostPrice = parseNumber(costPrice);
    const parsedSellingPrice = parseNumber(sellingPrice);
    const parsedStock = Number(stock);

    if (!categoryId) {
      setErrorMessage('Kategori wajib dipilih.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Nama produk wajib diisi.');
      return;
    }

    if (!Number.isFinite(parsedCostPrice) || parsedCostPrice < 0) {
      setErrorMessage('Harga modal harus berupa angka valid.');
      return;
    }

    if (!Number.isFinite(parsedSellingPrice) || parsedSellingPrice < 0) {
      setErrorMessage('Harga jual harus berupa angka valid.');
      return;
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setErrorMessage('Stok harus berupa angka bulat valid.');
      return;
    }

    onSubmit({
      categoryId,
      name,
      description,
      costPrice: parsedCostPrice,
      sellingPrice: parsedSellingPrice,
      imageUrl,
      imageFile,
      isBundle,
      stock: parsedStock,
    });
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View>
            <Text style={styles.title}>{product ? 'Edit product' : 'Tambah product'}</Text>
            <Text style={styles.subtitle}>Lengkapi data product sesuai kategori toko.</Text>
          </View>

          <ScrollView contentContainerStyle={styles.form} style={styles.formScroll}>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Kategori</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => {
                  const isActive = categoryId === category.id;

                  return (
                    <Pressable
                      key={category.id}
                      style={[styles.categoryButton, isActive && styles.activeCategoryButton]}
                      onPress={() => setCategoryId(category.id)}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.categoryButtonText,
                          isActive && styles.activeCategoryButtonText,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Nama product</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={setName}
                placeholder="Contoh: Americano"
                placeholderTextColor={colors.placeholder}
                style={styles.input}
                value={name}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Deskripsi</Text>
              <TextInput
                multiline
                onChangeText={setDescription}
                placeholder="Catatan singkat product"
                placeholderTextColor={colors.placeholder}
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
                value={description}
              />
            </View>

            <View style={styles.twoColumns}>
              <View style={[styles.fieldGroup, styles.column]}>
                <Text style={styles.inputLabel}>Harga modal</Text>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={setCostPrice}
                  placeholder="0"
                  placeholderTextColor={colors.placeholder}
                  style={styles.input}
                  value={costPrice}
                />
              </View>
              <View style={[styles.fieldGroup, styles.column]}>
                <Text style={styles.inputLabel}>Harga jual</Text>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={setSellingPrice}
                  placeholder="0"
                  placeholderTextColor={colors.placeholder}
                  style={styles.input}
                  value={sellingPrice}
                />
              </View>
            </View>

            <View style={styles.twoColumns}>
              <View style={[styles.fieldGroup, styles.column]}>
                <Text style={styles.inputLabel}>Stok</Text>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={setStock}
                  placeholder="0"
                  placeholderTextColor={colors.placeholder}
                  style={styles.input}
                  value={stock}
                />
              </View>
              <View style={[styles.fieldGroup, styles.column]}>
                <Text style={styles.inputLabel}>Tipe</Text>
                <Pressable
                  style={[styles.bundleToggle, isBundle && styles.activeBundleToggle]}
                  onPress={() => setIsBundle((value) => !value)}
                >
                  <Text style={[styles.bundleToggleText, isBundle && styles.activeBundleToggleText]}>
                    {isBundle ? 'Bundle' : 'Product biasa'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Gambar product</Text>
              <View style={styles.imagePickerRow}>
                <View style={styles.imagePreview}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.imagePreviewAsset} />
                  ) : (
                    <Ionicons color={colors.secondaryText} name="image-outline" size={28} />
                  )}
                </View>
                <View style={styles.imagePickerInfo}>
                  <Text style={styles.imagePickerTitle} numberOfLines={1}>
                    {imageFile?.fileName ?? (imageUrl ? 'Gambar product tersedia' : 'Belum ada gambar')}
                  </Text>
                  <Text style={styles.imagePickerMeta}>
                    Pilih gambar dari galeri untuk product ini.
                  </Text>
                  <View style={styles.imageActions}>
                    <Pressable style={styles.imageButton} onPress={handlePickImage}>
                      <Ionicons color={colors.onPrimary} name="cloud-upload-outline" size={18} />
                      <Text style={styles.imageButtonText}>Upload</Text>
                    </Pressable>
                    {imageUrl ? (
                      <Pressable
                        style={styles.clearImageButton}
                        onPress={() => {
                          setImageFile(null);
                          setImageUrl('');
                        }}
                      >
                        <Text style={styles.clearImageButtonText}>Hapus gambar</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.actions}>
            <Pressable disabled={isSaving} style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Batal</Text>
            </Pressable>
            <Pressable
              disabled={isSaving || categories.length === 0}
              style={[styles.primaryButton, (isSaving || categories.length === 0) && styles.disabledButton]}
              onPress={handleSubmit}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.primaryButtonText}>Simpan</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(23, 32, 42, 0.42)',
  },
  modal: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '92%',
    gap: 16,
    padding: 20,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4,
  },
  formScroll: {
    maxHeight: 520,
  },
  form: {
    gap: 14,
    paddingBottom: 2,
  },
  fieldGroup: {
    gap: 7,
  },
  inputLabel: {
    color: colors.strongMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  textArea: {
    minHeight: 84,
    paddingTop: 12,
    paddingBottom: 12,
  },
  imagePickerRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  imagePreview: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  imagePreviewAsset: {
    width: '100%',
    height: '100%',
  },
  imagePickerInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 5,
    minWidth: 0,
  },
  imagePickerTitle: {
    color: colors.text,
    fontWeight: '800',
  },
  imagePickerMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  imageActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  imageButton: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  imageButtonText: {
    color: colors.onPrimary,
    fontWeight: '800',
  },
  clearImageButton: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  clearImageButtonText: {
    color: colors.strongMuted,
    fontWeight: '800',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  activeCategoryButton: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.secondaryText,
    fontWeight: '800',
  },
  activeCategoryButtonText: {
    color: colors.onPrimary,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  bundleToggle: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  activeBundleToggle: {
    backgroundColor: colors.primary,
  },
  bundleToggleText: {
    color: colors.secondaryText,
    fontWeight: '800',
  },
  activeBundleToggleText: {
    color: colors.onPrimary,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  secondaryButtonText: {
    color: colors.strongMuted,
    fontWeight: '800',
  },
  primaryButton: {
    minWidth: 110,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
