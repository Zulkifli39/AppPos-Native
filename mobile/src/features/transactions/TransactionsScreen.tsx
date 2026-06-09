import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchTransactions } from '../../services/transactions';
import { colors } from '../../theme/colors';
import type { PaymentMethod, TransactionHistory } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';

const transactionsQueryKey = ['transactions'];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

const paymentMethodLabel: Record<PaymentMethod, string> = {
  cash: 'Cash',
  qris: 'QRIS',
};

function getItemsSummary(transaction: TransactionHistory) {
  return transaction.details
    .map((detail) => `${detail.productName} x${detail.quantity}`)
    .join(', ');
}

export function TransactionsScreen() {
  const transactionsQuery = useQuery({
    queryKey: transactionsQueryKey,
    queryFn: fetchTransactions,
  });

  const transactions = transactionsQuery.data ?? [];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
          <Text style={styles.sectionMeta}>{transactions.length} transaksi terakhir</Text>
        </View>
      </View>

      {transactionsQuery.isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateCopy}>Memuat riwayat transaksi...</Text>
        </View>
      ) : null}

      {transactionsQuery.isError ? (
        <View style={styles.stateBox}>
          <Ionicons color={colors.secondaryText} name="warning-outline" size={28} />
          <Text style={styles.stateTitle}>Transaksi gagal dimuat</Text>
          <Text style={styles.stateCopy}>Pastikan backend aktif dan token login masih valid.</Text>
        </View>
      ) : null}

      {!transactionsQuery.isLoading && !transactionsQuery.isError && transactions.length === 0 ? (
        <View style={styles.stateBox}>
          <Ionicons color={colors.secondaryText} name="receipt-outline" size={28} />
          <Text style={styles.stateTitle}>Belum ada transaksi</Text>
          <Text style={styles.stateCopy}>Transaksi yang berhasil akan tampil di tabel ini.</Text>
        </View>
      ) : null}

      {!transactionsQuery.isLoading && !transactionsQuery.isError && transactions.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableHeadText, styles.numberCell]}>No</Text>
              <Text style={[styles.tableHeadText, styles.codeCell]}>Kode</Text>
              <Text style={[styles.tableHeadText, styles.dateCell]}>Tanggal</Text>
              <Text style={[styles.tableHeadText, styles.cashierCell]}>Kasir</Text>
              <Text style={[styles.tableHeadText, styles.itemsCell]}>Item</Text>
              <Text style={[styles.tableHeadText, styles.methodCell]}>Bayar</Text>
              <Text style={[styles.tableHeadText, styles.amountCell]}>Total</Text>
              <Text style={[styles.tableHeadText, styles.amountCell]}>Diterima</Text>
              <Text style={[styles.tableHeadText, styles.amountCell]}>Kembali</Text>
            </View>

            {transactions.map((transaction, index) => (
              <View key={transaction.id} style={styles.tableRow}>
                <Text style={[styles.tableText, styles.numberCell]}>{index + 1}</Text>
                <Text style={[styles.tableValue, styles.codeCell]} numberOfLines={1}>
                  {transaction.transactionCode}
                </Text>
                <Text style={[styles.tableText, styles.dateCell]} numberOfLines={1}>
                  {formatDateTime(transaction.createdAt)}
                </Text>
                <Text style={[styles.tableText, styles.cashierCell]} numberOfLines={1}>
                  {transaction.cashierName ?? '-'}
                </Text>
                <Text style={[styles.tableText, styles.itemsCell]} numberOfLines={2}>
                  {getItemsSummary(transaction)}
                </Text>
                <View style={styles.methodCell}>
                  <View style={styles.methodBadge}>
                    <Text style={styles.methodBadgeText}>
                      {paymentMethodLabel[transaction.paymentMethod]}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.tableValue, styles.amountCell]}>
                  {formatCurrency(transaction.totalAmount)}
                </Text>
                <Text style={[styles.tableText, styles.amountCell]}>
                  {transaction.amountReceived === null || transaction.amountReceived === undefined
                    ? '-'
                    : formatCurrency(transaction.amountReceived)}
                </Text>
                <Text style={[styles.tableText, styles.amountCell]}>
                  {transaction.amountChange === null || transaction.amountChange === undefined
                    ? '-'
                    : formatCurrency(transaction.amountChange)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  sectionHeader: {
    minHeight: 44,
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
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
  },
  stateBox: {
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 18,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  stateCopy: {
    color: colors.muted,
    textAlign: 'center',
  },
  table: {
    minWidth: 1180,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeader: {
    minHeight: 44,
    backgroundColor: colors.controlLight,
  },
  tableHeadText: {
    color: colors.strongMuted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tableText: {
    color: colors.secondaryText,
    fontWeight: '700',
  },
  tableValue: {
    color: colors.text,
    fontWeight: '900',
  },
  numberCell: {
    width: 58,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  codeCell: {
    width: 160,
    paddingHorizontal: 12,
  },
  dateCell: {
    width: 170,
    paddingHorizontal: 12,
  },
  cashierCell: {
    width: 150,
    paddingHorizontal: 12,
  },
  itemsCell: {
    width: 260,
    paddingHorizontal: 12,
  },
  methodCell: {
    width: 92,
    paddingHorizontal: 10,
  },
  methodBadge: {
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  methodBadgeText: {
    color: colors.strongMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  amountCell: {
    width: 130,
    paddingHorizontal: 12,
    textAlign: 'right',
  },
});
