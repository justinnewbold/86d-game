import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Error Boundary to catch and display React errors
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#0D0D0D' }}>
          <Text style={{ color: '#DC2626', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Something went wrong</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14, marginBottom: 10, textAlign: 'center' }}>
            {this.state.error?.toString()}
          </Text>
          <Text style={{ color: '#A3A3A3', fontSize: 12, textAlign: 'center' }}>
            {this.state.errorInfo?.componentStack?.substring(0, 500)}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 20, backgroundColor: '#F59E0B', padding: 15, borderRadius: 8 }}
            onPress={() => window.location.reload()}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Reload App</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
