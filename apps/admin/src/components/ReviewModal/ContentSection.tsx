import { useState } from 'react';
import { Button, Message, useToaster } from 'rsuite';
import MarkdownIt from 'markdown-it';
import { API_CONFIG } from '@/config/api';
import { getStoredTokens } from '@/request';

const md = new MarkdownIt();

interface ContentSectionProps {
  content: string;
  passageId: number;
}

const ContentSection = ({ content, passageId }: ContentSectionProps) => {
  const [aiContent, setAiContent] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const toaster = useToaster();

  const handleAiReview = () => {
    if (!passageId) return;
    
    setIsAiLoading(true);
    setAiContent('');
    
    const { accessToken, refreshToken } = getStoredTokens();

    fetch(`${API_CONFIG.baseURL}/ai/chat/stream?passageId=${passageId}`, {
      headers: {
        'Authorization': accessToken || '',
        'X-Refresh-Token': refreshToken || '',
        'Accept': 'text/event-stream',
      },
    }).then(response => {
      if (!response.ok) {
        throw new Error('SSE 连接失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  setAiContent(prev => prev + data.content);
                } catch (error) {
                  console.error('解析 AI 响应失败:', error);
                }
              }
            }
          }
        } catch (error) {
          console.error('处理流数据失败:', error);
          toaster.push(
            <Message type="error">AI 审核请求失败</Message>
          );
        } finally {
          setIsAiLoading(false);
        }
      };

      processStream();
    }).catch(error => {
      console.error('SSE 连接错误:', error);
      setIsAiLoading(false);
      toaster.push(
        <Message type="error">AI 审核请求失败</Message>
      );
    });
  };

  return (
    <div>
      <h6 className="section-header">内容</h6>
      <Button 
        appearance="primary" 
        color="cyan" 
        onClick={handleAiReview}
        loading={isAiLoading}
        style={{ marginBottom: '16px' }}
      >
        AI 审核
      </Button>
      {aiContent && (
        <div className="ai-review-container">
          <h6 className="section-header">AI 审核结果</h6>
          <div 
            className="markdown-content ai-content" 
            dangerouslySetInnerHTML={{ __html: md.render(aiContent) }}
          />
        </div>
      )}
      <div 
        className="markdown-content" 
        dangerouslySetInnerHTML={{ __html: content ? md.render(content) : '' }}
      />
    </div>
  );
};

export default ContentSection; 