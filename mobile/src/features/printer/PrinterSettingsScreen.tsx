import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  clearPrinterSettings,
  getPrinterSettings,
  savePrinterSettings,
  type PrinterPaperWidth,
  type PrinterSettings,
} from '../../services/printerSettings';
import { colors } from '../../theme/colors';

const paperWidths: PrinterPaperWidth[] = ['58', '80'];

export function PrinterSettingsScreen() {
  const [address, setAddress] = useState('');
  const [isDirectPrintEnabled, setIsDirectPrintEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [paperWidth, setPaperWidth] = useState<PrinterPaperWidth>('58');

  useEffect(() => {
    getPrinterSettings()
      .then((settings) => {
        setAddress(settings.address);
        setIsDirectPrintEnabled(settings.isDirectPrintEnabled);
        setName(settings.name);
        setPaperWidth(settings.paperWidth);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave() {
    const payload: PrinterSettings = {
      address: address.trim(),
      isDirectPrintEnabled,
      name: name.trim(),
      paperWidth,
    };

    setIsSaving(true);

    try {
      await savePrinterSettings(payload);
      Alert.alert('Printer', 'Pengaturan printer berhasil disimpan.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClear() {
    await clearPrinterSettings();
    setAddress('');
    setIsDirectPrintEnabled(false);
    setName('');
    setPaperWidth('58');
  }

  function handleTestPrint() {
    if (!name.trim() && !address.trim()) {
      Alert.alert('Printer', 'Isi nama atau alamat printer terlebih dahulu.');
      return;
    }

    Alert.alert('Test Print', 'Konfigurasi printer sudah tersimpan untuk tahap integrasi native.');
  }

  if (isLoading) {
    return (
      <View style={styles.stateBox}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.stateCopy}>Memuat pengaturan printer...</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Pengaturan Printer</Text>
          <Text style={styles.sectionMeta}>
            {name || address ? 'Printer tersimpan' : 'Printer belum dipilih'}
          </Text>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.statusRow}>
          <View style={styles.statusIcon}>
            <Ionicons color={colors.primary} name="print-outline" size={24} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle} numberOfLines={1}>
              {name || 'Printer POS'}
            </Text>
            <Text style={styles.statusMeta} numberOfLines={1}>
              {address || 'Belum ada alamat printer'}
            </Text>
          </View>
          <View style={[styles.statusBadge, isDirectPrintEnabled && styles.activeStatusBadge]}>
            <Text style={[styles.statusBadgeText, isDirectPrintEnabled && styles.activeStatusBadgeText]}>
              {isDirectPrintEnabled ? 'Direct' : 'Manual'}
            </Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.inputLabel}>Nama printer</Text>
          <TextInput
            onChangeText={setName}
            placeholder="Contoh: iWare Kasir"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            value={name}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.inputLabel}>Alamat Bluetooth / MAC</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setAddress}
            placeholder="Contoh: 00:11:22:33:44:55"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            value={address}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.inputLabel}>Lebar kertas</Text>
          <View style={styles.segmentedControl}>
            {paperWidths.map((width) => {
              const isActive = paperWidth === width;

              return (
                <Pressable
                  key={width}
                  style={[styles.segmentButton, isActive && styles.activeSegmentButton]}
                  onPress={() => setPaperWidth(width)}
                >
                  <Text style={[styles.segmentText, isActive && styles.activeSegmentText]}>
                    {width} mm
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          style={styles.toggleRow}
          onPress={() => setIsDirectPrintEnabled((value) => !value)}
        >
          <View>
            <Text style={styles.toggleTitle}>Cetak langsung</Text>
            <Text style={styles.toggleMeta}>{isDirectPrintEnabled ? 'Aktif' : 'Nonaktif'}</Text>
          </View>
          <View style={[styles.switchTrack, isDirectPrintEnabled && styles.activeSwitchTrack]}>
            <View style={[styles.switchThumb, isDirectPrintEnabled && styles.activeSwitchThumb]} />
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={handleClear}>
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </Pressable>
          <Pressable style={styles.testButton} onPress={handleTestPrint}>
            <Ionicons color={colors.primary} name="receipt-outline" size={18} />
            <Text style={styles.testButtonText}>Test Print</Text>
          </Pressable>
          <Pressable
            disabled={isSaving}
            style={[styles.primaryButton, isSaving && styles.disabledButton]}
            onPress={handleSave}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>Simpan</Text>
            )}
          </Pressable>
        </View>
      </View>
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
  panel: {
    gap: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  statusIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  statusInfo: {
    flex: 1,
    minWidth: 0,
  },
  statusTitle: {
    color: colors.text,
    fontWeight: '900',
  },
  statusMeta: {
    color: colors.muted,
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  activeStatusBadge: {
    backgroundColor: colors.primary,
  },
  statusBadgeText: {
    color: colors.strongMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  activeStatusBadgeText: {
    color: colors.onPrimary,
  },
  fieldGroup: {
    gap: 7,
  },
  inputLabel: {
    color: colors.strongMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  activeSegmentButton: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    color: colors.strongMuted,
    fontWeight: '900',
  },
  activeSegmentText: {
    color: colors.onPrimary,
  },
  toggleRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  toggleTitle: {
    color: colors.text,
    fontWeight: '900',
  },
  toggleMeta: {
    color: colors.muted,
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
  },
  switchTrack: {
    width: 50,
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderRadius: 15,
    backgroundColor: colors.control,
  },
  activeSwitchTrack: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  activeSwitchThumb: {
    alignSelf: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  secondaryButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  secondaryButtonText: {
    color: colors.strongMuted,
    fontWeight: '800',
  },
  testButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#eaf7f3',
  },
  testButtonText: {
    color: colors.primary,
    fontWeight: '900',
  },
  primaryButton: {
    minWidth: 104,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.6,
  },
  stateBox: {
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateCopy: {
    color: colors.muted,
    marginTop: 8,
    textAlign: 'center',
  },
});
