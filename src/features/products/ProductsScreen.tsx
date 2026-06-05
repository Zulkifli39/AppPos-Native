import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import type { Product } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';

type ProductsScreenProps = {
  products: Product[];
};

export function ProductsScreen({ products }: ProductsScreenProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Daftar produk</Text>
      {products.map((product) => (
        <View key={product.id} style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>{product.name}</Text>
            <Text style={styles.rowMeta}>
              {product.isBundle ? 'Bundle' : 'Produk'} / stok {product.stock}
            </Text>
          </View>
          <Text style={styles.rowValue}>{formatCurrency(product.sellingPrice)}</Text>
        </View>
      ))}
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
  row: {
    minHeight: 68,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTitle: {
    color: colors.text,
    fontWeight: '800',
  },
  rowMeta: {
    color: colors.muted,
    marginTop: 3,
  },
  rowValue: {
    color: colors.primary,
    fontWeight: '800',
  },
});
