import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type SummaryCardProps = {
  label: string;
  value: string;
};

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 72,
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
});
