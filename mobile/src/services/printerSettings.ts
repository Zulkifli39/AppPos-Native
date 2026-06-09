import AsyncStorage from '@react-native-async-storage/async-storage';

export type PrinterPaperWidth = '58' | '80';

export type PrinterSettings = {
  address: string;
  isDirectPrintEnabled: boolean;
  name: string;
  paperWidth: PrinterPaperWidth;
};

const printerSettingsStorageKey = 'native_pos_printer_settings';

const defaultPrinterSettings: PrinterSettings = {
  address: '',
  isDirectPrintEnabled: false,
  name: '',
  paperWidth: '58',
};

export async function getPrinterSettings(): Promise<PrinterSettings> {
  const rawSettings = await AsyncStorage.getItem(printerSettingsStorageKey);

  if (!rawSettings) {
    return defaultPrinterSettings;
  }

  try {
    return {
      ...defaultPrinterSettings,
      ...(JSON.parse(rawSettings) as Partial<PrinterSettings>),
    };
  } catch (_error) {
    return defaultPrinterSettings;
  }
}

export async function savePrinterSettings(settings: PrinterSettings) {
  await AsyncStorage.setItem(printerSettingsStorageKey, JSON.stringify(settings));
}

export async function clearPrinterSettings() {
  await AsyncStorage.removeItem(printerSettingsStorageKey);
}
