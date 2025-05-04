import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { CustomProvider } from 'rsuite';
import { useThemeStore } from './store/theme';
import zhCN from 'rsuite/locales/zh_CN';
import 'rsuite/dist/rsuite.min.css';

const App = () => {
  const { theme } = useThemeStore();

  return (
    <CustomProvider theme={theme} locale={zhCN}>
      <RouterProvider router={router} />
    </CustomProvider>
  );
};

export default App;
