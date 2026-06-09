import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import type { CartItem, PaymentMethod, Product } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';

type PosScreenProps = {
  products: Product[];
  cartItems: CartItem[];
  cartTotal: number;
  isError: boolean;
  isLoading: boolean;
  onAddProduct: (product: Product) => void;
  onCheckout: (
    paymentMethod: PaymentMethod,
    amountReceived?: number,
  ) => Promise<{ id: number; transactionCode: string }>;
  onDecreaseItem: (productId: number) => void;
  onRemoveItem: (productId: number) => void;
  onUpdateItemNotes: (productId: number, notes: string) => void;
};

export function PosScreen({
  products,
  cartItems,
  cartTotal,
  isError,
  isLoading,
  onAddProduct,
  onCheckout,
  onDecreaseItem,
  onRemoveItem,
  onUpdateItemNotes,
}: PosScreenProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [notesTarget, setNotesTarget] = useState<CartItem | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [isCashModalVisible, setIsCashModalVisible] = useState(false);
  const [amountReceivedText, setAmountReceivedText] = useState('');
  const [stockError, setStockError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);
  const [successPayment, setSuccessPayment] = useState<{
    amountChange?: number;
    amountReceived?: number;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    totalAmount: number;
    transactionCode: string;
  } | null>(null);
  const tileWidth = isWide
    ? Math.max(168, Math.min(220, Math.floor((width - 470) / 3)))
    : Math.max(148, Math.floor((width - 52) / 2));
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const categories = useMemo(() => {
    const categoryMap = new Map<number, string>();

    products.forEach((product) => {
      categoryMap.set(product.categoryId, product.categoryName ?? 'Tanpa kategori');
    });

    return [...categoryMap.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [products]);
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory =
          selectedCategoryId === 'all' || product.categoryId === selectedCategoryId;
        const searchableText = [product.name, product.description, product.categoryName]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const matchesSearch = normalizedSearch ? searchableText.includes(normalizedSearch) : true;

        return matchesCategory && matchesSearch;
      }),
    [normalizedSearch, products, selectedCategoryId],
  );

  function openNotesModal(item: CartItem) {
    setNotesTarget(item);
    setNotesDraft(item.notes ?? '');
  }

  function closeNotesModal() {
    setNotesTarget(null);
    setNotesDraft('');
  }

  function saveNotes() {
    if (!notesTarget) {
      return;
    }

    onUpdateItemNotes(notesTarget.product.id, notesDraft);
    closeNotesModal();
  }

  function getCartQuantity(productId: number) {
    return cartItems.find((item) => item.product.id === productId)?.quantity ?? 0;
  }

  function validateCartStock() {
    for (const item of cartItems) {
      const latestProduct = products.find((product) => product.id === item.product.id) ?? item.product;

      if (item.quantity > latestProduct.stock) {
        return `Stok ${item.product.name} tidak cukup.`;
      }
    }

    return '';
  }

  function handleAddProduct(product: Product) {
    const currentQuantity = getCartQuantity(product.id);

    if (currentQuantity >= product.stock) {
      setStockError(`Stok ${product.name} tidak cukup.`);
      return;
    }

    setStockError('');
    onAddProduct(product);
  }

  function parseAmount(value: string) {
    const numericText = value.replace(/[^\d]/g, '');
    return numericText ? Number(numericText) : 0;
  }

  function openCashModal() {
    const stockMessage = validateCartStock();

    if (stockMessage) {
      setStockError(stockMessage);
      return;
    }

    setAmountReceivedText('');
    setPaymentError('');
    setStockError('');
    setIsCashModalVisible(true);
  }

  function closeCashModal() {
    if (isPaying) {
      return;
    }

    setIsCashModalVisible(false);
    setAmountReceivedText('');
    setPaymentError('');
  }

  async function completePayment(paymentMethod: PaymentMethod, amountReceived?: number) {
    const stockMessage = validateCartStock();

    if (stockMessage) {
      setStockError(stockMessage);
      return;
    }

    setIsPaying(true);
    setPaymentError('');
    setStockError('');

    try {
      const transaction = await onCheckout(paymentMethod, amountReceived);
      const receiptItems = cartItems.map((item) => ({
        ...item,
        product: { ...item.product },
      }));

      setSuccessPayment({
        amountChange:
          paymentMethod === 'cash' && amountReceived !== undefined
            ? amountReceived - cartTotal
            : undefined,
        amountReceived,
        items: receiptItems,
        paymentMethod,
        totalAmount: cartTotal,
        transactionCode: transaction.transactionCode,
      });
      setIsCashModalVisible(false);
      setAmountReceivedText('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pembayaran gagal diproses.';
      setPaymentError(message);
      setStockError(message.toLowerCase().includes('stok') ? message : '');
    } finally {
      setIsPaying(false);
    }
  }

  function handleCashPayment() {
    const amountReceived = parseAmount(amountReceivedText);

    if (amountReceived < cartTotal) {
      setPaymentError('Uang pelanggan kurang dari total pembayaran.');
      return;
    }

    completePayment('cash', amountReceived);
  }

  function handleQrisPayment() {
    completePayment('qris');
  }

  function escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function buildReceiptHtml(payment: NonNullable<typeof successPayment>) {
    const itemRows = payment.items
      .map(
        (item) => `
          <tr>
            <td>
              <strong>${escapeHtml(item.product.name)}</strong>
              <div class="muted">${item.quantity} x ${formatCurrency(item.product.sellingPrice)}</div>
              ${item.notes ? `<div class="notes">${escapeHtml(item.notes)}</div>` : ''}
            </td>
            <td class="right">${formatCurrency(item.quantity * item.product.sellingPrice)}</td>
          </tr>
        `,
      )
      .join('');

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { color: #111827; font-family: Arial, sans-serif; margin: 0; padding: 16px; }
            .receipt { margin: 0 auto; max-width: 280px; }
            .center { text-align: center; }
            .title { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
            .muted { color: #64748b; font-size: 11px; margin-top: 3px; }
            .notes { color: #146c5f; font-size: 11px; margin-top: 3px; }
            .line { border-top: 1px dashed #94a3b8; margin: 10px 0; }
            table { border-collapse: collapse; width: 100%; }
            td { font-size: 12px; padding: 5px 0; vertical-align: top; }
            .right { text-align: right; }
            .summary td { font-weight: 700; padding: 3px 0; }
            .total td { font-size: 14px; font-weight: 900; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="center">
              <div class="title">Native POS</div>
              <div class="muted">Struk Pembayaran</div>
              <div class="muted">${escapeHtml(payment.transactionCode)}</div>
            </div>
            <div class="line"></div>
            <table>${itemRows}</table>
            <div class="line"></div>
            <table class="summary">
              <tr><td>Metode</td><td class="right">${payment.paymentMethod === 'cash' ? 'Cash' : 'QRIS'}</td></tr>
              <tr class="total"><td>Total</td><td class="right">${formatCurrency(payment.totalAmount)}</td></tr>
              ${
                payment.paymentMethod === 'cash'
                  ? `<tr><td>Diterima</td><td class="right">${formatCurrency(payment.amountReceived ?? 0)}</td></tr>
                     <tr><td>Kembali</td><td class="right">${formatCurrency(payment.amountChange ?? 0)}</td></tr>`
                  : ''
              }
            </table>
            <div class="line"></div>
            <div class="center muted">Terima kasih</div>
          </div>
        </body>
      </html>
    `;
  }

  async function printReceipt() {
    if (!successPayment) {
      return;
    }

    setIsPrintingReceipt(true);

    try {
      await Print.printAsync({ html: buildReceiptHtml(successPayment) });
      Alert.alert('Cetak struk', 'Struk berhasil dikirim ke printer.');
    } catch (error) {
      Alert.alert(
        'Cetak struk gagal',
        error instanceof Error ? error.message : 'Printer belum tersedia atau koneksi bermasalah.',
      );
    } finally {
      setIsPrintingReceipt(false);
    }
  }

  if (successPayment) {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successIconWrap}>
          <Ionicons color={colors.primary} name="checkmark" size={52} />
        </View>
        <Text style={styles.successTitle}>Pembayaran Berhasil</Text>
        <Text style={styles.successCode}>{successPayment.transactionCode}</Text>
        <View style={styles.successSummary}>
          <View style={styles.successSummaryRow}>
            <Text style={styles.successSummaryLabel}>Metode</Text>
            <Text style={styles.successSummaryValue}>
              {successPayment.paymentMethod === 'cash' ? 'Cash' : 'QRIS'}
            </Text>
          </View>
          <View style={styles.successSummaryRow}>
            <Text style={styles.successSummaryLabel}>Total</Text>
            <Text style={styles.successSummaryValue}>
              {formatCurrency(successPayment.totalAmount)}
            </Text>
          </View>
          {successPayment.paymentMethod === 'cash' ? (
            <>
              <View style={styles.successSummaryRow}>
                <Text style={styles.successSummaryLabel}>Diterima</Text>
                <Text style={styles.successSummaryValue}>
                  {formatCurrency(successPayment.amountReceived ?? 0)}
                </Text>
              </View>
              <View style={styles.successSummaryRow}>
                <Text style={styles.successSummaryLabel}>Kembalian</Text>
                <Text style={styles.successSummaryValue}>
                  {formatCurrency(successPayment.amountChange ?? 0)}
                </Text>
              </View>
            </>
          ) : null}
        </View>
        <View style={styles.successActions}>
          <Pressable
            style={styles.printReceiptButton}
            onPress={() => setIsReceiptModalVisible(true)}
          >
            <Ionicons color={colors.primary} name="print-outline" size={19} />
            <Text style={styles.printReceiptButtonText}>Cetak Struk</Text>
          </Pressable>
          <Pressable style={styles.backToCashierButton} onPress={() => setSuccessPayment(null)}>
            <Text style={styles.backToCashierButtonText}>Kembali Ke Kasir</Text>
          </Pressable>
        </View>
        <Modal
          animationType="fade"
          transparent
          visible={isReceiptModalVisible}
          onRequestClose={() => setIsReceiptModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.receiptModal}>
              <ScrollView contentContainerStyle={styles.receiptScrollContent}>
                <View style={styles.receiptPaper}>
                  <Text style={styles.receiptTitle}>Native POS</Text>
                  <Text style={styles.receiptMuted}>Struk Pembayaran</Text>
                  <Text style={styles.receiptMuted}>{successPayment.transactionCode}</Text>
                  <View style={styles.receiptDivider} />
                  {successPayment.items.map((item) => (
                    <View key={item.product.id} style={styles.receiptItemRow}>
                      <View style={styles.receiptItemInfo}>
                        <Text style={styles.receiptItemName}>{item.product.name}</Text>
                        <Text style={styles.receiptMuted}>
                          {item.quantity} x {formatCurrency(item.product.sellingPrice)}
                        </Text>
                        {item.notes ? <Text style={styles.receiptNotes}>{item.notes}</Text> : null}
                      </View>
                      <Text style={styles.receiptItemTotal}>
                        {formatCurrency(item.quantity * item.product.sellingPrice)}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.receiptDivider} />
                  <View style={styles.receiptSummaryRow}>
                    <Text style={styles.receiptSummaryLabel}>Metode</Text>
                    <Text style={styles.receiptSummaryValue}>
                      {successPayment.paymentMethod === 'cash' ? 'Cash' : 'QRIS'}
                    </Text>
                  </View>
                  <View style={styles.receiptSummaryRow}>
                    <Text style={styles.receiptTotalLabel}>Total</Text>
                    <Text style={styles.receiptTotalValue}>
                      {formatCurrency(successPayment.totalAmount)}
                    </Text>
                  </View>
                  {successPayment.paymentMethod === 'cash' ? (
                    <>
                      <View style={styles.receiptSummaryRow}>
                        <Text style={styles.receiptSummaryLabel}>Diterima</Text>
                        <Text style={styles.receiptSummaryValue}>
                          {formatCurrency(successPayment.amountReceived ?? 0)}
                        </Text>
                      </View>
                      <View style={styles.receiptSummaryRow}>
                        <Text style={styles.receiptSummaryLabel}>Kembali</Text>
                        <Text style={styles.receiptSummaryValue}>
                          {formatCurrency(successPayment.amountChange ?? 0)}
                        </Text>
                      </View>
                    </>
                  ) : null}
                  <View style={styles.receiptDivider} />
                  <Text style={styles.receiptMuted}>Terima kasih</Text>
                </View>
              </ScrollView>
              <View style={styles.receiptActions}>
                <Pressable
                  disabled={isPrintingReceipt}
                  style={styles.secondaryButton}
                  onPress={() => setIsReceiptModalVisible(false)}
                >
                  <Text style={styles.secondaryButtonText}>Tutup</Text>
                </Pressable>
                <Pressable
                  disabled={isPrintingReceipt}
                  style={[styles.saveNotesButton, isPrintingReceipt && styles.disabledButton]}
                  onPress={printReceipt}
                >
                  {isPrintingReceipt ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <Text style={styles.saveNotesButtonText}>Print</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.layout, !isWide && styles.stackedLayout]}>
        <View style={[styles.productsPane, !isWide && styles.stackedPane]}>
        <View style={[styles.sectionHeader, !isWide && styles.stackedHeader]}>
          <View>
            <Text style={styles.sectionTitle}>Kasir</Text>
            <Text style={styles.sectionMeta}>
              {filteredProducts.length} dari {products.length} produk tersedia
            </Text>
          </View>
          <View style={styles.searchWrap}>
            <Ionicons color={colors.secondaryText} name="search-outline" size={19} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setSearchQuery}
              placeholder="Cari produk"
              placeholderTextColor={colors.placeholder}
              style={styles.searchInput}
              value={searchQuery}
            />
          </View>
        </View>

        {categories.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryFilterRow}>
              <Pressable
                style={[
                  styles.categoryFilterButton,
                  selectedCategoryId === 'all' && styles.activeCategoryFilterButton,
                ]}
                onPress={() => setSelectedCategoryId('all')}
              >
                <Text
                  style={[
                    styles.categoryFilterText,
                    selectedCategoryId === 'all' && styles.activeCategoryFilterText,
                  ]}
                >
                  Semua
                </Text>
              </Pressable>
              {categories.map((category) => {
                const isActive = selectedCategoryId === category.id;

                return (
                  <Pressable
                    key={category.id}
                    style={[styles.categoryFilterButton, isActive && styles.activeCategoryFilterButton]}
                    onPress={() => setSelectedCategoryId(category.id)}
                  >
                    <Text
                      numberOfLines={1}
                      style={[styles.categoryFilterText, isActive && styles.activeCategoryFilterText]}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        ) : null}

        {isLoading ? (
          <StateBox copy="Memuat produk kasir..." icon="refresh-outline" title="Memuat produk" />
        ) : null}

        {isError ? (
          <StateBox copy="Pastikan backend aktif dan token login masih valid." icon="warning-outline" title="Produk gagal dimuat" />
        ) : null}

        {!isLoading && !isError && products.length === 0 ? (
          <StateBox copy="Produk yang dibuat di menu Produk akan muncul di sini." icon="cube-outline" title="Belum ada produk" />
        ) : null}

        {!isLoading && !isError && products.length > 0 && filteredProducts.length === 0 ? (
          <StateBox copy="Coba pilih kategori atau kata kunci lain." icon="search-outline" title="Produk tidak ditemukan" />
        ) : null}

        {!isLoading && !isError && filteredProducts.length > 0 ? (
          <View style={styles.productGrid}>
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;

              return (
                <Pressable
                  key={product.id}
                  disabled={isOutOfStock}
                  style={[
                    styles.productTile,
                    { width: tileWidth },
                    isOutOfStock && styles.disabledProductTile,
                  ]}
                  onPress={() => handleAddProduct(product)}
                >
                  <View style={styles.productImage}>
                    {product.imageUrl ? (
                      <Image source={{ uri: product.imageUrl }} style={styles.productImageAsset} />
                    ) : (
                      <Ionicons color={colors.secondaryText} name="image-outline" size={24} />
                    )}
                    <View style={[styles.stockBadge, isOutOfStock && styles.dangerStockBadge]}>
                      <Text style={[styles.stockBadgeText, isOutOfStock && styles.dangerStockBadgeText]}>
                        {isOutOfStock ? 'Habis' : product.stock}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productCategory} numberOfLines={1}>
                      {product.categoryName ?? 'Tanpa kategori'}
                    </Text>
                  </View>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>{formatCurrency(product.sellingPrice)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

        <View style={[styles.cartPane, !isWide && styles.stackedPane]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Keranjang</Text>
            <Text style={styles.sectionMeta}>{cartItems.length} item dipilih</Text>
          </View>
        </View>
        <View style={styles.cartList}>
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartTitle}>Keranjang kosong</Text>
              <Text style={styles.emptyCartCopy}>Pilih produk untuk mulai transaksi.</Text>
            </View>
          ) : (
            cartItems.map((item) => (
              <View key={item.product.id} style={styles.cartRow}>
                <View style={styles.cartProductInfo}>
                  <Text style={styles.cartProductName}>{item.product.name}</Text>
                  <Text style={styles.cartProductMeta}>
                    {item.quantity} x {formatCurrency(item.product.sellingPrice)}
                  </Text>
                  {item.notes ? (
                    <Text style={styles.cartProductNotes} numberOfLines={2}>
                      {item.notes}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.cartActions}>
                  <Pressable style={styles.notesButton} onPress={() => openNotesModal(item)}>
                    <Ionicons
                      color={item.notes ? colors.primary : colors.strongMuted}
                      name={item.notes ? 'document-text' : 'document-text-outline'}
                      size={17}
                    />
                    <Text style={[styles.notesButtonText, item.notes && styles.activeNotesButtonText]}>
                      Catatan
                    </Text>
                  </Pressable>
                  <Pressable style={styles.qtyButton} onPress={() => onDecreaseItem(item.product.id)}>
                    <Ionicons color={colors.strongMuted} name="remove-outline" size={18} />
                  </Pressable>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <Pressable style={styles.qtyButton} onPress={() => handleAddProduct(item.product)}>
                    <Ionicons color={colors.strongMuted} name="add-outline" size={18} />
                  </Pressable>
                  <Pressable style={styles.removeButton} onPress={() => onRemoveItem(item.product.id)}>
                    <Ionicons color={colors.danger} name="trash-outline" size={17} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <View>
          <Text style={styles.checkoutLabel}>Total pembayaran</Text>
          <Text style={styles.checkoutTotal}>{formatCurrency(cartTotal)}</Text>
        </View>
        {stockError ? <Text style={styles.stockErrorText}>{stockError}</Text> : null}
        {paymentError && paymentError !== stockError ? (
          <Text style={styles.paymentErrorText}>{paymentError}</Text>
        ) : null}
        <View style={styles.paymentMethods}>
          <Pressable
            disabled={cartItems.length === 0 || isPaying}
            style={[styles.paymentButton, (cartItems.length === 0 || isPaying) && styles.disabledButton]}
            onPress={openCashModal}
          >
            <Ionicons color={colors.onPrimary} name="cash-outline" size={20} />
            <Text style={styles.paymentButtonText}>Cash</Text>
          </Pressable>
          <Pressable
            disabled={cartItems.length === 0 || isPaying}
            style={[
              styles.paymentButton,
              styles.qrisButton,
              (cartItems.length === 0 || isPaying) && styles.disabledButton,
            ]}
            onPress={handleQrisPayment}
          >
            {isPaying ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <Ionicons color={colors.onPrimary} name="qr-code-outline" size={20} />
                <Text style={styles.paymentButtonText}>QRIS</Text>
              </>
            )}
          </Pressable>
        </View>
        </View>
      </View>

      <Modal animationType="fade" transparent visible={notesTarget !== null} onRequestClose={closeNotesModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.notesModal}>
            <View>
              <Text style={styles.modalTitle}>Catatan item</Text>
              <Text style={styles.modalSubtitle} numberOfLines={1}>
                {notesTarget?.product.name}
              </Text>
            </View>
            <TextInput
              multiline
              onChangeText={setNotesDraft}
              placeholder="Contoh: tanpa gula, dibungkus terpisah"
              placeholderTextColor={colors.placeholder}
              style={styles.notesInput}
              textAlignVertical="top"
              value={notesDraft}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryButton} onPress={closeNotesModal}>
                <Text style={styles.secondaryButtonText}>Batal</Text>
              </Pressable>
              <Pressable
                style={styles.clearNotesButton}
                onPress={() => {
                  setNotesDraft('');
                  if (notesTarget) {
                    onUpdateItemNotes(notesTarget.product.id, '');
                  }
                  closeNotesModal();
                }}
              >
                <Text style={styles.clearNotesButtonText}>Hapus</Text>
              </Pressable>
              <Pressable style={styles.saveNotesButton} onPress={saveNotes}>
                <Text style={styles.saveNotesButtonText}>Simpan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent visible={isCashModalVisible} onRequestClose={closeCashModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.cashModal}>
            <View>
              <Text style={styles.modalTitle}>Pembayaran Cash</Text>
              <Text style={styles.modalSubtitle}>Masukkan nominal uang dari pelanggan.</Text>
            </View>
            <View style={styles.cashTotalBox}>
              <Text style={styles.cashTotalLabel}>Total belanja</Text>
              <Text style={styles.cashTotalValue}>{formatCurrency(cartTotal)}</Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Uang diterima</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={(value) => {
                  setAmountReceivedText(value);
                  setPaymentError('');
                }}
                placeholder="Contoh: 50000"
                placeholderTextColor={colors.placeholder}
                style={styles.cashInput}
                value={amountReceivedText}
              />
            </View>
            <View style={styles.changeBox}>
              <Text style={styles.changeLabel}>Kembalian</Text>
              <Text style={styles.changeValue}>
                {formatCurrency(Math.max(0, parseAmount(amountReceivedText) - cartTotal))}
              </Text>
            </View>
            {paymentError ? <Text style={styles.paymentErrorText}>{paymentError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable disabled={isPaying} style={styles.secondaryButton} onPress={closeCashModal}>
                <Text style={styles.secondaryButtonText}>Batal</Text>
              </Pressable>
              <Pressable
                disabled={isPaying}
                style={[styles.saveNotesButton, isPaying && styles.disabledButton]}
                onPress={handleCashPayment}
              >
                {isPaying ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text style={styles.saveNotesButtonText}>Bayar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function StateBox({
  copy,
  icon,
  title,
}: {
  copy: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
}) {
  return (
    <View style={styles.stateBox}>
      <Ionicons color={colors.secondaryText} name={icon} size={28} />
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateCopy}>{copy}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  stackedLayout: {
    flexDirection: 'column',
  },
  productsPane: {
    marginTop: 8,
    flex: 1,
    gap: 14,
    minWidth: 0,
    paddingBottom: 4,
  },
  cartPane: {
    width: 380,
    gap: 12,
    minHeight: 390,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    marginTop: 8,
    borderColor: colors.border,
  },
  stackedPane: {
    width: '100%',
  },
  sectionHeader: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stackedHeader: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 12,
  },
  categoryFilterButton: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCategoryFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryFilterText: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '800',
  },
  activeCategoryFilterText: {
    color: colors.onPrimary,
  },
  searchWrap: {
    minWidth: 220,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    minHeight: 42,
    color: colors.text,
  },
  productTile: {
    minWidth: 138,
    maxWidth: 220,
    minHeight: 214,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledProductTile: {
    opacity: 0.55,
  },
  productImage: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.controlLight,
    position: 'relative',
  },
  productImageAsset: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    gap: 4,
    padding: 12,
  },
  productName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  productCategory: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  productFooter: {
    gap: 4,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  productPrice: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 34,
    minHeight: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dangerStockBadge: {
    backgroundColor: '#fff1f0',
    borderColor: '#ffd0cc',
  },
  stockBadgeText: {
    color: colors.strongMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  dangerStockBadgeText: {
    color: colors.danger,
  },
  stateBox: {
    minHeight: 230,
    alignItems: 'center',
    justifyContent: 'center',
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
  cartList: {
    flex: 1,
    minHeight: 190,
  },
  emptyCart: {
    flex: 1,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  emptyCartTitle: {
    color: colors.text,
    fontWeight: '800',
  },
  emptyCartCopy: {
    color: colors.muted,
    marginTop: 4,
  },
  cartRow: {
    minHeight: 78,
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cartProductInfo: {
    flex: 1,
    paddingRight: 10,
  },
  cartProductName: {
    color: colors.text,
    fontWeight: '800',
  },
  cartProductMeta: {
    color: colors.muted,
    marginTop: 3,
    fontSize: 12,
  },
  cartProductNotes: {
    color: colors.primary,
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  cartActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  notesButton: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  notesButtonText: {
    color: colors.strongMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  activeNotesButtonText: {
    color: colors.primary,
  },
  qtyButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  qtyText: {
    minWidth: 26,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '900',
  },
  removeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#fff1f0',
  },
  checkoutLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  checkoutTotal: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  paymentErrorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
  },
  stockErrorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  qrisButton: {
    backgroundColor: colors.dark,
  },
  paymentButtonText: {
    color: colors.onPrimary,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.55,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(23, 32, 42, 0.42)',
  },
  notesModal: {
    width: '100%',
    maxWidth: 460,
    gap: 14,
    padding: 18,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  cashModal: {
    width: '100%',
    maxWidth: 460,
    gap: 14,
    padding: 18,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: colors.muted,
    marginTop: 3,
    fontWeight: '700',
  },
  notesInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  fieldGroup: {
    gap: 7,
  },
  inputLabel: {
    color: colors.strongMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  cashInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  cashTotalBox: {
    gap: 3,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.controlLight,
  },
  cashTotalLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  cashTotalValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  changeBox: {
    gap: 3,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#eaf7f3',
    borderWidth: 1,
    borderColor: '#c7eadf',
  },
  changeLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  changeValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
  },
  modalActions: {
    flexDirection: 'row',
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
  clearNotesButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#fff1f0',
  },
  clearNotesButtonText: {
    color: colors.danger,
    fontWeight: '800',
  },
  saveNotesButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  saveNotesButtonText: {
    color: colors.onPrimary,
    fontWeight: '900',
  },
  successScreen: {
    flex: 1,
    minHeight: 640,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
    padding: 22,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  successIconWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 46,
    backgroundColor: colors.surface,
  },
  successTitle: {
    color: colors.onPrimary,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  successCode: {
    color: '#d8f5ec',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  successSummary: {
    width: '100%',
    maxWidth: 420,
    gap: 10,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  successSummaryRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  successSummaryLabel: {
    color: '#d8f5ec',
    fontWeight: '800',
  },
  successSummaryValue: {
    color: colors.onPrimary,
    fontWeight: '900',
    textAlign: 'right',
  },
  successActions: {
    width: '100%',
    maxWidth: 420,
    gap: 10,
  },
  printReceiptButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  printReceiptButtonText: {
    color: colors.primary,
    fontWeight: '900',
  },
  backToCashierButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.dark,
  },
  backToCashierButtonText: {
    color: colors.onPrimary,
    fontWeight: '900',
  },
  receiptModal: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    gap: 14,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  receiptScrollContent: {
    alignItems: 'center',
  },
  receiptPaper: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'stretch',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  receiptTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  receiptMuted: {
    color: colors.muted,
    marginTop: 3,
    fontSize: 11,
    textAlign: 'center',
  },
  receiptDivider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    marginVertical: 10,
  },
  receiptItemRow: {
    minHeight: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 5,
  },
  receiptItemInfo: {
    flex: 1,
  },
  receiptItemName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  receiptNotes: {
    color: colors.primary,
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
  },
  receiptItemTotal: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },
  receiptSummaryRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  receiptSummaryLabel: {
    color: colors.strongMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  receiptSummaryValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },
  receiptTotalLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  receiptTotalValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  receiptActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
