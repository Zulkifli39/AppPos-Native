import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AppSidebar, type AppMenuItem } from './AppSidebar';
import { mockProducts } from '../constants/mockProducts';
import { LoginScreen } from '../features/auth/LoginScreen';
import { CategoriesScreen } from '../features/categories/CategoriesScreen';
import { PosScreen } from '../features/pos/PosScreen';
import { ProductsScreen } from '../features/products/ProductsScreen';
import { TransactionsScreen } from '../features/transactions/TransactionsScreen';
import { useCartStore } from '../store/cartStore';
import { colors } from '../theme/colors';
import type { AppUser } from '../types/pos';
import { formatCurrency } from '../utils/currency';

export function PosApp() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const [signedInUser, setSignedInUser] = useState<AppUser | null>(null);
  const [activeMenu, setActiveMenu] = useState<AppMenuItem>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { items, addItem, clearCart } = useCartStore();

  const cartTotal = useMemo(
    () => items.reduce((total, item) => total + item.quantity * item.product.sellingPrice, 0),
    [items],
  );

  if (!signedInUser) {
    return <LoginScreen onSignIn={setSignedInUser} />;
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="dark" />
      <View style={[styles.shell, !isWide && styles.stackedShell]}>
        <AppSidebar
          activeMenu={activeMenu}
          isCollapsed={isSidebarCollapsed}
          isWide={isWide}
          user={signedInUser}
          onMenuChange={setActiveMenu}
          onSignOut={() => setSignedInUser(null)}
          onToggleCollapse={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        />

        <View style={styles.main}>
          <View style={[styles.topBar, !isWide && styles.stackedTopBar]}>
            <View style={styles.header}>
              <View style={styles.userBlock}>
                <Text style={styles.title} numberOfLines={1}>
                  {`Halo, ${signedInUser.fullName}`}
                </Text>
                <Text style={styles.headerMeta}>Kelola operasional toko dari satu tempat.</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
            {activeMenu === 'dashboard' && (
              <PosScreen
                cartTotal={cartTotal}
                cartItems={items}
                onAddProduct={addItem}
                onCheckout={clearCart}
                products={mockProducts}
              />
            )}
            {activeMenu === 'categories' && <CategoriesScreen />}
            {activeMenu === 'products' && <ProductsScreen />}
            {activeMenu === 'transactions' && <TransactionsScreen />}
            {activeMenu === 'reports' && (
              <PlaceholderScreen
                title="Laporan"
                copy="Ringkasan penjualan dan performa toko akan ditampilkan di sini."
              />
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

function PlaceholderScreen({ title, copy }: { title: string; copy: string }) {
  return (
    <View style={styles.placeholderSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.placeholderBox}>
        <Text style={styles.placeholderTitle}>{title} belum tersedia</Text>
        <Text style={styles.placeholderCopy}>{copy}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  shell: {
    flex: 1,
    flexDirection: 'row',
  },
  stackedShell: {
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  topBar: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stackedTopBar: {
    flexDirection: 'column',
    paddingHorizontal: 16,
  },
  header: {
    flex: 1,
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  userBlock: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  headerMeta: {
    color: colors.muted,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  placeholderSection: {
    gap: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  placeholderBox: {
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  placeholderCopy: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
});
