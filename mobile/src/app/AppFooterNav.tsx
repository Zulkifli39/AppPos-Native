import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export const appMenuItems = [
  'dashboard',
  'categories',
  'products',
  'transactions',
  'printer',
] as const;

export type AppMenuItem = (typeof appMenuItems)[number];

export const appMenuConfig: Record<
  AppMenuItem,
  {
    icon: ComponentProps<typeof Ionicons>['name'];
    label: string;
  }
> = {
  dashboard: {
    icon: 'grid-outline',
    label: 'Kasir',
  },
  categories: {
    icon: 'pricetags-outline',
    label: 'Kategori',
  },
  products: {
    icon: 'cube-outline',
    label: 'Produk',
  },
  transactions: {
    icon: 'receipt-outline',
    label: 'Transaksi',
  },
  printer: {
    icon: 'print-outline',
    label: 'Printer',
  },
};

type AppFooterNavProps = {
  activeMenu: AppMenuItem;
  onMenuChange: (menu: AppMenuItem) => void;
};

export function AppFooterNav({ activeMenu, onMenuChange }: AppFooterNavProps) {
  return (
    <View style={styles.footer}>
      {appMenuItems.map((item) => {
        const menu = appMenuConfig[item];
        const isActive = activeMenu === item;

        return (
          <Pressable
            key={item}
            accessibilityLabel={menu.label}
            style={[styles.navButton, isActive && styles.activeNavButton]}
            onPress={() => onMenuChange(item)}
          >
            <Ionicons
              color={isActive ? colors.primary : colors.secondaryText}
              name={menu.icon}
              size={22}
            />
            <Text
              numberOfLines={1}
              style={[styles.navLabel, isActive && styles.activeNavLabel]}
            >
              {menu.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 4,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 8,
  },
  activeNavButton: {
    backgroundColor: colors.controlLight,
  },
  navLabel: {
    maxWidth: '100%',
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '800',
  },
  activeNavLabel: {
    color: colors.primary,
  },
});
