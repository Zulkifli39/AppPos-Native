import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SummaryCard } from '../components/SummaryCard';
import { mockProducts } from '../constants/mockProducts';
import { LoginScreen } from '../features/auth/LoginScreen';
import { PosScreen } from '../features/pos/PosScreen';
import { ProductsScreen } from '../features/products/ProductsScreen';
import { TransactionsScreen } from '../features/transactions/TransactionsScreen';
import { useCartStore } from '../store/cartStore';
import { colors } from '../theme/colors';
import type { AppUser } from '../types/pos';
import { formatCurrency } from '../utils/currency';

const tabs = ['pos', 'products', 'transactions'] as const;
type Tab = (typeof tabs)[number];

const tabLabel: Record<Tab, string> = {
  pos: 'POS',
  products: 'Produk',
  transactions: 'Transaksi',
};

const roleLabel: Record<AppUser['role'], string> = {
  admin: 'Admin',
  cashier: 'Kasir',
};

export function PosApp() {
  const [signedInUser, setSignedInUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('pos');
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
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Native POS</Text>
          <Text style={styles.title}>{signedInUser.fullName}</Text>
          <Text style={styles.headerMeta}>{roleLabel[signedInUser.role]}</Text>
        </View>
        <Pressable style={styles.secondaryButton} onPress={() => setSignedInUser(null)}>
          <Text style={styles.secondaryButtonText}>Keluar</Text>
        </Pressable>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard label="Total cart" value={formatCurrency(cartTotal)} />
        <SummaryCard label="Item" value={`${items.length}`} />
        <SummaryCard label="Stok rendah" value="3" />
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tabLabel[tab]}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'pos' && (
          <PosScreen
            cartTotal={cartTotal}
            onAddProduct={addItem}
            onCheckout={clearCart}
            products={mockProducts}
          />
        )}
        {activeTab === 'products' && <ProductsScreen products={mockProducts} />}
        {activeTab === 'transactions' && <TransactionsScreen />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  headerMeta: {
    color: colors.muted,
    marginTop: 2,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.control,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.secondaryText,
    fontWeight: '700',
  },
  activeTabText: {
    color: colors.onPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  secondaryButton: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  secondaryButtonText: {
    color: colors.strongMuted,
    fontWeight: '700',
  },
});
