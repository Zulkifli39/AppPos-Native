import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppFooterNav, type AppMenuItem } from './AppFooterNav';
import { LoginScreen } from '../features/auth/LoginScreen';
import { CategoriesScreen } from '../features/categories/CategoriesScreen';
import { PosScreen } from '../features/pos/PosScreen';
import { PrinterSettingsScreen } from '../features/printer/PrinterSettingsScreen';
import { ProductsScreen } from '../features/products/ProductsScreen';
import { getStoredSession, signOut } from '../services/auth';
import { fetchProducts } from '../services/products';
import { createTransaction } from '../services/transactions';
import { TransactionsScreen } from '../features/transactions/TransactionsScreen';
import { useCartStore } from '../store/cartStore';
import { colors } from '../theme/colors';
import type { AppUser, PaymentMethod } from '../types/pos';

const productsQueryKey = ['products'];

export function PosApp() {
  const [signedInUser, setSignedInUser] = useState<AppUser | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [activeMenu, setActiveMenu] = useState<AppMenuItem>('dashboard');
  const { items, addItem, clearCart, decreaseItem, removeItem, updateItemNotes } = useCartStore();
  const queryClient = useQueryClient();
  const productsQuery = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
    enabled: signedInUser !== null,
  });

  useEffect(() => {
    let isMounted = true;

    getStoredSession()
      .then((session) => {
        if (isMounted && session) {
          setSignedInUser(session.user);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsRestoringSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSignOut() {
    await signOut();
    setSignedInUser(null);
  }

  const cartTotal = useMemo(
    () => items.reduce((total, item) => total + item.quantity * item.product.sellingPrice, 0),
    [items],
  );

  async function handleCheckout(paymentMethod: PaymentMethod, amountReceived?: number) {
    if (!signedInUser) {
      throw new Error('User belum login.');
    }

    const transaction = await createTransaction(
      {
        userId: signedInUser.id,
        subtotal: cartTotal,
        discount: 0,
        totalAmount: cartTotal,
        paymentMethod,
        amountReceived,
      },
      items,
    );

    clearCart();
    await queryClient.invalidateQueries({ queryKey: productsQueryKey });
    return transaction;
  }

  if (isRestoringSession) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!signedInUser) {
    return <LoginScreen onSignIn={setSignedInUser} />;
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        <View style={styles.main}>
          <View style={styles.topBar}>
            <View style={styles.header}>
              <View style={styles.userBlock}>
                <Text style={styles.title} numberOfLines={1}>
                  {`Halo, ${signedInUser.fullName}`}
                </Text>
                <Text style={styles.headerMeta}>Kelola operasional toko dari satu tempat.</Text>
              </View>
              <Pressable
                accessibilityLabel="Keluar"
                hitSlop={8}
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Ionicons color={colors.strongMuted} name="log-out-outline" size={22} />
              </Pressable>
            </View>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
            {activeMenu === 'dashboard' && (
              <PosScreen
                cartTotal={cartTotal}
                cartItems={items}
                isError={productsQuery.isError}
                isLoading={productsQuery.isLoading}
                onAddProduct={addItem}
                onDecreaseItem={decreaseItem}
                onCheckout={handleCheckout}
                onRemoveItem={removeItem}
                onUpdateItemNotes={updateItemNotes}
                products={productsQuery.data ?? []}
              />
            )}
            {activeMenu === 'categories' && <CategoriesScreen />}
            {activeMenu === 'products' && <ProductsScreen />}
            {activeMenu === 'transactions' && <TransactionsScreen />}
            {activeMenu === 'printer' && <PrinterSettingsScreen />}
          </ScrollView>
        </View>
        <AppFooterNav activeMenu={activeMenu} onMenuChange={setActiveMenu} />
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
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  shell: {
    flex: 1,
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
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flex: 1,
    marginTop: 12,
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  userBlock: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 4,
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
  signOutButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
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
