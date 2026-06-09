import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import type { Category } from '../../types/pos';

type CategoryModalProps = {
  category?: Category | null;
  isSaving: boolean;
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; description?: string | null }) => void;
};

export function CategoryModal({
  category,
  isSaving,
  visible,
  onClose,
  onSubmit,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(category?.name ?? '');
    setDescription(category?.description ?? '');
    setErrorMessage('');
  }, [category, visible]);

  function handleSubmit() {
    if (!name.trim()) {
      setErrorMessage('Nama kategori wajib diisi.');
      return;
    }

    onSubmit({
      name,
      description,
    });
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View>
            <Text style={styles.title}>{category ? 'Edit kategori' : 'Tambah kategori'}</Text>
            <Text style={styles.subtitle}>
              {category ? 'Perbarui detail kategori produk.' : 'Buat kategori baru untuk produk.'}
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Nama kategori</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={setName}
              placeholder="Contoh: Minuman"
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
              placeholder="Catatan singkat kategori"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, styles.textArea]}
              textAlignVertical="top"
              value={description}
            />
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.actions}>
            <Pressable disabled={isSaving} style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Batal</Text>
            </Pressable>
            <Pressable
              disabled={isSaving}
              style={[styles.primaryButton, isSaving && styles.disabledButton]}
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
    maxWidth: 460,
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
    minHeight: 96,
    paddingTop: 12,
    paddingBottom: 12,
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
