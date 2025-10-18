import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface OrderCommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

const OrderCommentForm = ({ onSubmit }: OrderCommentFormProps) => {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Nhập bình luận của bạn..."
        rows={3}
        disabled={submitting}
        className="resize-none"
      />
      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="sm"
          disabled={!content.trim() || submitting}
        >
          <Send className="h-4 w-4 mr-2" />
          {submitting ? "Đang gửi..." : "Gửi"}
        </Button>
      </div>
    </form>
  );
};

export default OrderCommentForm;
