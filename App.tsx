import { AppProviders } from './src/app/AppProviders';
import { PosApp } from './src/app/PosApp';

export default function App() {
  return (
    <AppProviders>
      <PosApp />
    </AppProviders>
  );
}
