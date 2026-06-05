import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

export function TransactionsScreen() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Transaksi terbaru</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Belum ada transaksi</Text>
        <Text style={styles.emptyCopy}>Data transaksi akan diambil dari tabel transactions Supabase.</Text>
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
  emptyState: {
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyCopy: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
});
