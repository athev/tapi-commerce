
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface QuickQuestionsProps {
  onQuestionSelect: (question: string) => void;
  productType?: string;
}

const QuickQuestions = ({ onQuestionSelect, productType }: QuickQuestionsProps) => {
  const getQuestions = () => {
    const commonQuestions = [
      "Sản phẩm này còn hàng không?",
      "Có hỗ trợ thanh toán COD không?",
      "Thời gian giao hàng là bao lâu?",
    ];

    const digitalQuestions = [
      "Làm sao để tải sản phẩm sau khi mua?",
      "Có hướng dẫn sử dụng không?",
      "Sản phẩm có được cập nhật không?",
    ];

    const accountQuestions = [
      "Tài khoản có bảo hành không?",
      "Làm sao để nhận thông tin tài khoản?",
      "Có hỗ trợ đổi mật khẩu không?",
    ];

    if (productType === 'shared_account' || productType === 'upgrade_account_no_pass' || productType === 'upgrade_account_with_pass') {
      return [...commonQuestions, ...accountQuestions];
    } else if (productType === 'file_download' || productType === 'license_key_delivery') {
      return [...commonQuestions, ...digitalQuestions];
    }

    return commonQuestions;
  };

  const questions = getQuestions();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Câu hỏi thường gặp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="w-full justify-start text-left h-auto py-2 px-3"
            onClick={() => onQuestionSelect(question)}
          >
            {question}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickQuestions;
