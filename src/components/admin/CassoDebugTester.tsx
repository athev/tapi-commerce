
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CassoDebugTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const runDebugTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      console.log('🔍 Starting Casso webhook debug test...');
      
      const { data, error } = await supabase.functions.invoke('debug-casso-webhook', {
        body: { test: 'manual_test' }
      });
      
      if (error) {
        console.error('❌ Error calling debug function:', error);
        toast.error('Lỗi khi gọi debug function: ' + error.message);
        return;
      }
      
      console.log('✅ Debug test result:', data);
      setTestResult(data);
      
      if (data?.success) {
        toast.success('Test thành công! Kiểm tra kết quả bên dưới.');
      } else {
        toast.error('Test thất bại: ' + (data?.error || 'Unknown error'));
      }
      
    } catch (error) {
      console.error('❌ Debug test error:', error);
      toast.error('Có lỗi xảy ra khi test');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Casso Webhook Debug Tester</CardTitle>
        <p className="text-sm text-gray-600">
          Test xem Casso webhook có hoạt động không và kiểm tra kết nối
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDebugTest}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Đang test...' : 'Chạy Debug Test'}
        </Button>
        
        {testResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Kết quả test:</h3>
            <pre className="text-sm bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
            
            {testResult.success && (
              <div className="mt-3 space-y-2">
                <div className="text-sm">
                  <strong>Webhook Status:</strong> {testResult.webhook_status}
                </div>
                <div className="text-sm">
                  <strong>Response:</strong> 
                  <pre className="mt-1 text-xs bg-gray-100 p-2 rounded">
                    {testResult.webhook_response}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="text-sm text-gray-600 mt-4">
          <p><strong>Chú ý:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Function này sẽ test gọi casso-webhook với payload giả</li>
            <li>Kiểm tra cả logs của debug function và casso-webhook</li>
            <li>Nếu webhook hoạt động, status sẽ là 200</li>
            <li>Nếu có lỗi, sẽ hiển thị chi tiết lỗi</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CassoDebugTester;
