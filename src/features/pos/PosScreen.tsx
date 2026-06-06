import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { colors } from '../../theme/colors';
import type { CartItem, Product } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';

type PosScreenProps = {
  products: Product[];
  cartItems: CartItem[];
  cartTotal: number;
  onAddProduct: (product: Product) => void;
  onCheckout: () => void;
};

export function PosScreen({
  products,
  cartItems,
  cartTotal,
  onAddProduct,
  onCheckout,
}: PosScreenProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const tileWidth = isWide
    ? Math.max(150, Math.min(220, Math.floor((width - 500) / 3)))
    : Math.max(140, Math.floor((width - 64) / 2));

  return (
    <View style={[styles.layout, !isWide && styles.stackedLayout]}>
      <View style={[styles.productsPane, !isWide && styles.stackedPane]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Produk cepat</Text>
          <Text style={styles.sectionMeta}>{products.length} produk tersedia</Text>
        </View>
        <View style={styles.productGrid}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              style={[styles.productTile, { width: tileWidth }]}
              onPress={() => onAddProduct(product)}
            >
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{formatCurrency(product.sellingPrice)}</Text>
              <Text style={styles.productMeta}>Stok {product.stock}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.cartPane, !isWide && styles.stackedPane]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Keranjang</Text>
          <Text style={styles.sectionMeta}>{cartItems.length} item</Text>
        </View>
        <View style={styles.cartList}>
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartTitle}>Keranjang kosong</Text>
              <Text style={styles.emptyCartCopy}>Pilih produk untuk mulai transaksi.</Text>
            </View>
          ) : (
            cartItems.map((item) => (
              <View key={item.product.id} style={styles.cartRow}>
                <View style={styles.cartProductInfo}>
                  <Text style={styles.cartProductName}>{item.product.name}</Text>
                  <Text style={styles.cartProductMeta}>
                    {item.quantity} x {formatCurrency(item.product.sellingPrice)}
                  </Text>
                </View>
                <Text style={styles.cartProductTotal}>
                  {formatCurrency(item.quantity * item.product.sellingPrice)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View>
          <Text style={styles.checkoutLabel}>Total pembayaran</Text>
          <Text style={styles.checkoutTotal}>{formatCurrency(cartTotal)}</Text>
        </View>
        <Pressable
          disabled={cartItems.length === 0}
          style={[styles.primaryButton, cartItems.length === 0 && styles.disabledButton]}
          onPress={onCheckout}
        >
          <Text style={styles.primaryButtonText}>Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  stackedLayout: {
    flexDirection: 'column',
  },
  productsPane: {
    borderRadius: 12,
    marginTop: 8,
    flex: 1,
    gap: 12,
    minWidth: 0,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartPane: {
    width: 360,
    gap: 12,
    minHeight: 390,
    padding: 18,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    marginTop: 8,
    borderColor: colors.border,
  },
  stackedPane: {
    width: '100%',
  },
  sectionHeader: {
    minHeight: 34,
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
    fontSize: 12,
    fontWeight: '700',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  productTile: {
    minWidth: 138,
    maxWidth: 220,
    minHeight: 110,
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.background,
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
  cartList: {
    flex: 1,
    minHeight: 190,
  },
  emptyCart: {
    flex: 1,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  emptyCartTitle: {
    color: colors.text,
    fontWeight: '800',
  },
  emptyCartCopy: {
    color: colors.muted,
    marginTop: 4,
  },
  cartRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cartProductInfo: {
    flex: 1,
    paddingRight: 10,
  },
  cartProductName: {
    color: colors.text,
    fontWeight: '800',
  },
  cartProductMeta: {
    color: colors.muted,
    marginTop: 3,
    fontSize: 12,
  },
  cartProductTotal: {
    color: colors.text,
    fontWeight: '800',
  },
  checkoutLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  checkoutTotal: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
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
  disabledButton: {
    opacity: 0.55,
  },
});
