import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import type { Product } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';

type PosScreenProps = {
  products: Product[];
  cartTotal: number;
  onAddProduct: (product: Product) => void;
  onCheckout: () => void;
};

export function PosScreen({ products, cartTotal, onAddProduct, onCheckout }: PosScreenProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Produk cepat</Text>
      <View style={styles.productGrid}>
        {products.map((product) => (
          <Pressable key={product.id} style={styles.productTile} onPress={() => onAddProduct(product)}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{formatCurrency(product.sellingPrice)}</Text>
            <Text style={styles.productMeta}>Stok {product.stock}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutLabel}>Total pembayaran</Text>
          <Text style={styles.checkoutTotal}>{formatCurrency(cartTotal)}</Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={onCheckout}>
          <Text style={styles.primaryButtonText}>Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productTile: {
    width: '47%',
    minHeight: 116,
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  productPrice: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  productMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  checkoutBar: {
    gap: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkoutLabel: {
    color: colors.muted,
  },
  checkoutTotal: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontWeight: '800',
  },
});
