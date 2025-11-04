import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface QuantitySelectorProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
}

const QuantitySelector = ({ 
  value = 1, 
  onChange, 
  min = 1, 
  max = 999 
}: QuantitySelectorProps) => {
  const [quantity, setQuantity] = useState(value);

  const handleDecrease = () => {
    if (quantity > min) {
      const newValue = quantity - 1;
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      const newValue = quantity + 1;
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || min;
    const newValue = Math.max(min, Math.min(max, value));
    setQuantity(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="flex items-center border rounded-lg overflow-hidden w-fit">
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-9 w-9 rounded-none"
        onClick={handleDecrease}
        disabled={quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <input 
        type="number"
        className="w-12 h-9 text-center border-x bg-background focus:outline-none"
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
      />
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-9 w-9 rounded-none"
        onClick={handleIncrease}
        disabled={quantity >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default QuantitySelector;
