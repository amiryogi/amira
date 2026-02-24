import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { useAuthStore } from '@/store/auth.store';
import { Alert } from 'react-native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock the Input and Button components
jest.mock('@/components/Input', () => {
  const { TextInput, Text, View } = require('react-native');
  return {
    Input: ({ label, error, onChangeText, ...props }: { label?: string; error?: string; onChangeText?: (text: string) => void; [key: string]: unknown }) => (
      <View>
        {label && <Text>{label}</Text>}
        <TextInput
          testID={`input-${label?.toLowerCase()}`}
          onChangeText={onChangeText}
          accessibilityLabel={label}
          {...props}
        />
        {error && <Text testID={`error-${label?.toLowerCase()}`}>{error}</Text>}
      </View>
    ),
  };
});

jest.mock('@/components/Button', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({ title, onPress, isLoading }: { title: string; onPress: () => void; isLoading?: boolean }) => (
      <TouchableOpacity
        testID="login-button"
        onPress={onPress}
        disabled={isLoading}
        accessibilityLabel={title}
      >
        <Text>{isLoading ? 'Loading...' : title}</Text>
      </TouchableOpacity>
    ),
  };
});

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
    });
  });

  it('should render the login form', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Welcome Back')).toBeTruthy();
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Password')).toBeTruthy();
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('should render brand name', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Amira')).toBeTruthy();
    expect(screen.getByText('Nepal Woolen Store')).toBeTruthy();
  });

  it('should show validation errors for empty fields', async () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-email')).toBeTruthy();
      expect(screen.getByTestId('error-password')).toBeTruthy();
    });
  });

  it('should show error for invalid email format', async () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByTestId('input-email'), 'invalid-email');
    fireEvent.changeText(screen.getByTestId('input-password'), 'ValidPass1!');
    fireEvent.press(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeTruthy();
    });
  });

  it('should show error for short password', async () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByTestId('input-email'), 'test@example.com');
    fireEvent.changeText(screen.getByTestId('input-password'), '12345');
    fireEvent.press(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByText('Min 6 characters')).toBeTruthy();
    });
  });

  it('should call login with valid credentials', async () => {
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ login: mockLogin });

    render(<LoginScreen />);
    fireEvent.changeText(screen.getByTestId('input-email'), 'ram@example.com');
    fireEvent.changeText(screen.getByTestId('input-password'), 'ValidPass1!');
    fireEvent.press(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('ram@example.com', 'ValidPass1!');
    });
  });

  it('should show alert on login failure', async () => {
    const mockLogin = jest.fn().mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });
    useAuthStore.setState({ login: mockLogin });

    render(<LoginScreen />);
    fireEvent.changeText(screen.getByTestId('input-email'), 'bad@example.com');
    fireEvent.changeText(screen.getByTestId('input-password'), 'WrongPass1!');
    fireEvent.press(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
    });
  });

  it('should navigate to register screen', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Sign Up'));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });
});
