import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ZaloCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xử lý xác thực Zalo OA...');
  const [oaInfo, setOaInfo] = useState<{ oa_id?: string; name?: string } | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const oaId = searchParams.get('oa_id');

      if (!code) {
        setStatus('error');
        setMessage('Không tìm thấy mã xác thực (code) từ Zalo.');
        return;
      }

      try {
        // Call Supabase Edge Function to exchange code for tokens
        const response = await fetch(
          `https://navlxvufcajsozhvbulu.supabase.co/functions/v1/zalo-oa-callback?code=${encodeURIComponent(code)}${oaId ? `&oa_id=${encodeURIComponent(oaId)}` : ''}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // The edge function returns HTML, so we need to check for success indicators
        const htmlResponse = await response.text();
        
        if (response.ok && htmlResponse.includes('thành công')) {
          setStatus('success');
          setMessage('Kết nối Zalo OA thành công!');
          
          // Try to extract OA info from response
          const oaIdMatch = htmlResponse.match(/OA ID:\s*([^<]+)/);
          const oaNameMatch = htmlResponse.match(/Tên OA:\s*([^<]+)/);
          
          if (oaIdMatch || oaNameMatch) {
            setOaInfo({
              oa_id: oaIdMatch?.[1]?.trim(),
              name: oaNameMatch?.[1]?.trim()
            });
          }
        } else if (htmlResponse.includes('lỗi') || htmlResponse.includes('error')) {
          setStatus('error');
          // Try to extract error message
          const errorMatch = htmlResponse.match(/Lỗi:\s*([^<]+)/);
          setMessage(errorMatch?.[1]?.trim() || 'Đã xảy ra lỗi khi kết nối Zalo OA.');
        } else {
          // Response OK but unknown format
          setStatus('success');
          setMessage('Đã xử lý callback từ Zalo.');
        }
      } catch (error) {
        console.error('Zalo callback error:', error);
        setStatus('error');
        setMessage('Không thể kết nối đến server. Vui lòng thử lại.');
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>Zalo OA Callback - tapi.vn</title>
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span>Đang xử lý...</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span>Thành công!</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <XCircle className="h-6 w-6 text-destructive" />
                  <span>Lỗi</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{message}</p>
            
            {status === 'success' && oaInfo && (
              <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                {oaInfo.name && (
                  <p><span className="font-medium">Tên OA:</span> {oaInfo.name}</p>
                )}
                {oaInfo.oa_id && (
                  <p><span className="font-medium">OA ID:</span> {oaInfo.oa_id}</p>
                )}
              </div>
            )}
            
            {status !== 'loading' && (
              <Button 
                onClick={() => window.close()}
                variant="outline"
                className="mt-4"
              >
                Đóng cửa sổ này
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ZaloCallback;
