import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { CustomProvider } from 'rsuite';
import { useThemeStore } from './store/theme';
import zhCN from 'rsuite/locales/zh_CN';
import 'rsuite/dist/rsuite.min.css';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {

    }
  }
})

const App = () => {
  const { theme } = useThemeStore();

  return (
    <QueryClientProvider client={queryClient}>
      <CustomProvider theme={theme} locale={zhCN}>
        <RouterProvider router={router} />
      </CustomProvider>
    </QueryClientProvider>
  );
};

export default App;
