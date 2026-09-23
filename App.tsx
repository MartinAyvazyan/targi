import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LanguageProvider } from './src/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <RootNavigator />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
