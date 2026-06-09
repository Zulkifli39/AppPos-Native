import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { signInWithUsername } from '../../services/auth';
import { colors } from '../../theme/colors';
import type { AppUser } from '../../types/pos';

type LoginScreenProps = {
  onSignIn: (user: AppUser) => void;
};

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    if (!username.trim() || !password) {
      setErrorMessage('Username dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await signInWithUsername(username, password);
      onSignIn(user);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login gagal. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.login}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.brand}>
          <Text style={styles.brandText}>Native POS</Text>
          <Text style={styles.brandCopy}>Masuk menggunakan akun kasir dari backend.</Text>
        </View>

        <View style={styles.panel}>
          <View>
            <Text style={styles.title}>Login kasir</Text>
            <Text style={styles.subtitle}>Gunakan username dan password yang terdaftar.</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setUsername}
              placeholder="contoh: admin"
              placeholderTextColor={colors.placeholder}
              returnKeyType="next"
              style={styles.input}
              value={username}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordInputWrap}>
              <TextInput
                onChangeText={setPassword}
                onSubmitEditing={handleSignIn}
                placeholder="Masukkan password"
                placeholderTextColor={colors.placeholder}
                returnKeyType="done"
                secureTextEntry={!isPasswordVisible}
                style={[styles.input, styles.passwordInput]}
                value={password}
              />
              <Pressable
                accessibilityLabel={isPasswordVisible ? 'Sembunyikan password' : 'Lihat password'}
                hitSlop={8}
                style={styles.passwordToggle}
                onPress={() => setIsPasswordVisible((visible) => !visible)}
              >
                <Ionicons
                  color={colors.secondaryText}
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                />
              </Pressable>
            </View>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable
            disabled={isLoading}
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleSignIn}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>Masuk</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  login: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.dark,
  },
  keyboard: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 460,
    gap: 22,
  },
  brand: {
    gap: 8,
  },
  brandText: {
    color: colors.onDark,
    fontSize: 34,
    fontWeight: '900',
  },
  brandCopy: {
    color: colors.onDarkMuted,
    fontSize: 15,
    lineHeight: 21,
  },
panel: {
  width: '100%',
  maxWidth: 460,
  alignSelf: 'center',
  gap: 16,
  padding: 20,
  borderRadius: 8,
  backgroundColor: colors.surface,
},
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: 8,
  },
  fieldGroup: {
    gap: 7,
  },
  inputLabel: {
    color: colors.strongMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  passwordInputWrap: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 0,
    width: 32,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
