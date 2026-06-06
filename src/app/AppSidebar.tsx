import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import type { AppUser } from '../types/pos';

export const appMenuItems = [
  'dashboard',
  'categories',
  'products',
  'transactions',
  'reports',
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
    label: 'Dashboard',
  },
  categories: {
    icon: 'pricetags-outline',
    label: 'Kategori',
  },
  products: {
    icon: 'cube-outline',
    label: 'Product',
  },
  transactions: {
    icon: 'receipt-outline',
    label: 'Riwayat Transaksi',
  },
  reports: {
    icon: 'bar-chart-outline',
    label: 'Laporan',
  },
};

const roleLabel: Record<AppUser['role'], string> = {
  admin: 'Admin',
  cashier: 'Kasir',
};

type AppSidebarProps = {
  activeMenu: AppMenuItem;
  isCollapsed: boolean;
  isWide: boolean;
  user: AppUser;
  onMenuChange: (menu: AppMenuItem) => void;
  onSignOut: () => void;
  onToggleCollapse: () => void;
};

export function AppSidebar({
  activeMenu,
  isCollapsed,
  isWide,
  user,
  onMenuChange,
  onSignOut,
  onToggleCollapse,
}: AppSidebarProps) {
  const isCompact = isWide && isCollapsed;
  const isMobileClosed = !isWide && isCollapsed;

  return (
    <View
      style={[
        styles.sidebar,
        isCompact && styles.collapsedSidebar,
        !isWide && styles.mobileSidebar,
        isMobileClosed && styles.closedMobileSidebar,
      ]}
    >
      <View style={[styles.brandRow, isCompact && styles.collapsedBrandRow]}>
        {!isCompact ? (
          <View style={styles.brandBlock}>
            <Text style={styles.eyebrow}>Native POS</Text>
            <Text style={styles.brandTitle}>Kasir</Text>
          </View>
        ) : (
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>N</Text>
          </View>
        )}

        <Pressable
          accessibilityLabel={isCollapsed ? 'Buka sidebar' : 'Kecilkan sidebar'}
          style={styles.sidebarToggle}
          onPress={onToggleCollapse}
        >
          <Ionicons
            color={colors.strongMuted}
            name={isCollapsed ? 'menu-outline' : isWide ? 'chevron-back-outline' : 'chevron-up-outline'}
            size={22}
          />
        </Pressable>
      </View>

      {!isMobileClosed ? (
        <>
          <View style={[styles.menuList, !isWide && styles.mobileMenuList]}>
            {appMenuItems.map((item) => {
              const menu = appMenuConfig[item];
              const isActive = activeMenu === item;

              return (
                <Pressable
                  key={item}
                  accessibilityLabel={menu.label}
                  style={[
                    styles.menuButton,
                    isCompact && styles.collapsedMenuButton,
                    !isWide && styles.mobileMenuButton,
                    isActive && styles.activeMenuButton,
                  ]}
                  onPress={() => onMenuChange(item)}
                >
                  <Ionicons
                    color={isActive ? colors.onPrimary : colors.secondaryText}
                    name={menu.icon}
                    size={20}
                  />
                  {!isCompact ? (
                    <Text
                      numberOfLines={1}
                      style={[styles.menuButtonText, isActive && styles.activeMenuButtonText]}
                    >
                      {menu.label}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View
            style={[
              styles.userPanel,
              isCompact && styles.collapsedUserPanel,
              !isWide && styles.mobileUserPanel,
            ]}
          >
            {!isCompact ? (
              <View style={styles.userBlock}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.fullName}
                </Text>
                <Text style={styles.headerMeta}>{roleLabel[user.role]}</Text>
              </View>
            ) : null}
            <Pressable style={styles.secondaryButton} onPress={onSignOut}>
              <Ionicons color={colors.strongMuted} name="log-out-outline" size={18} />
              {!isCompact ? <Text style={styles.secondaryButtonText}>Keluar</Text> : null}
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 248,
    padding: 16,
    justifyContent: 'space-between',
    gap: 18,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  collapsedSidebar: {
    width: 78,
    paddingHorizontal: 10,
  },
  mobileSidebar: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closedMobileSidebar: {
    gap: 0,
    paddingBottom: 10,
  },
  brandRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  collapsedBrandRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
  },
  brandBlock: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  brandTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  brandMark: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  brandMarkText: {
    color: colors.onPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  sidebarToggle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  menuList: {
    flex: 1,
    gap: 8,
  },
  mobileMenuList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 0,
  },
  menuButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  collapsedMenuButton: {
    width: 46,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  mobileMenuButton: {
    minWidth: 148,
    flex: 1,
    backgroundColor: colors.controlLight,
  },
  activeMenuButton: {
    backgroundColor: colors.primary,
  },
  menuButtonText: {
    flex: 1,
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: '800',
  },
  activeMenuButtonText: {
    color: colors.onPrimary,
  },
  userPanel: {
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  collapsedUserPanel: {
    alignItems: 'center',
  },
  mobileUserPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userBlock: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  headerMeta: {
    color: colors.muted,
    marginTop: 2,
  },
  secondaryButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
