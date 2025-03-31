import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { CartProvider } from "./hooks/useCart";
// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  return (
    <CartProvider>  
      <ExpoRoot context={ctx} />
    </CartProvider>
  );
}

registerRootComponent(App);