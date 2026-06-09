import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import type { Product } from '../../types/pos';

type ProductDeleteModalProps = {
  isDeleting: boolean;
  product?: Product | null;
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ProductDeleteModal({
  isDeleting,
  product,
  visible,
  onCancel,
  onConfirm,
}: ProductDeleteModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View>
            <Text style={styles.title}>Hapus product?</Text>
            <Text style={styles.copy}>
              Product {product ? `"${product.name}"` : 'ini'} akan dihapus dari daftar product.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable disabled={isDeleting} style={styles.secondaryButton} onPress={onCancel}>
              <Text style={styles.secondaryButtonText}>Batal</Text>
            </Pressable>
            <Pressable
              disabled={isDeleting}
              style={[styles.dangerButton, isDeleting && styles.disabledButton]}
              onPress={onConfirm}
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.dangerButtonText}>Hapus</Text>
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
    maxWidth: 430,
    gap: 18,
    padding: 20,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  copy: {
    color: colors.muted,
    marginTop: 6,
    lineHeight: 20,
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
  dangerButton: {
    minWidth: 104,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
  },
  dangerButtonText: {
    color: colors.onPrimary,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
