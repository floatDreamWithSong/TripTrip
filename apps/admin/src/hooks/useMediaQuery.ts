import { useState, useEffect } from 'react';

/**
 * 响应式媒体查询 Hook
 * @param query 媒体查询字符串，例如 '(max-width: 768px)'
 * @returns 当前媒体查询是否匹配
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // 设置初始值
    setMatches(mediaQuery.matches);
    
    // 创建事件监听器
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // 添加事件监听
    mediaQuery.addEventListener('change', handleChange);
    
    // 清理函数
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}; 