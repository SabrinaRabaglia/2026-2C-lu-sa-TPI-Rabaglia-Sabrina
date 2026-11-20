jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = ({ name, testID, ...props }) =>
    React.createElement(Text, { testID: testID || `icono-${name}`, ...props }, name);
  return {
    Ionicons: MockIcon,
  };
});

jest.mock('expo-image', () => {
  const React = require('react');
  const { Image } = require('react-native');
  return {
    Image: (props) => React.createElement(Image, props),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  let almacenamiento = {};
  return {
    getItem: jest.fn(async (clave) => almacenamiento[clave] ?? null),
    setItem: jest.fn(async (clave, valor) => {
      almacenamiento[clave] = valor;
    }),
    removeItem: jest.fn(async (clave) => {
      delete almacenamiento[clave];
    }),
    clear: jest.fn(async () => {
      almacenamiento = {};
    }),
  };
});

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { hostUri: '192.168.1.6:8081' },
  },
}));
