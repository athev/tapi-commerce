import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WarrantyPeriodInputProps {
  value: string;
  onChange: (value: string) => void;
}

type WarrantyType = 'none' | 'custom' | 'lifetime';
type WarrantyUnit = 'days' | 'months';

const parseWarrantyValue = (value: string): { type: WarrantyType; amount: number; unit: WarrantyUnit } => {
  if (!value || value === 'none') {
    return { type: 'none', amount: 7, unit: 'days' };
  }
  if (value === 'lifetime') {
    return { type: 'lifetime', amount: 7, unit: 'days' };
  }
  
  // Parse formats like "7_days", "1_month", "1_months", "3_months"
  const match = value.match(/^(\d+)_(days?|months?)$/);
  if (match) {
    const amount = parseInt(match[1], 10);
    const unit = match[2].startsWith('month') ? 'months' : 'days';
    return { type: 'custom', amount, unit };
  }
  
  return { type: 'none', amount: 7, unit: 'days' };
};

const formatWarrantyValue = (type: WarrantyType, amount: number, unit: WarrantyUnit): string => {
  if (type === 'none') return 'none';
  if (type === 'lifetime') return 'lifetime';
  return `${amount}_${unit}`;
};

const WarrantyPeriodInput = ({ value, onChange }: WarrantyPeriodInputProps) => {
  const parsed = parseWarrantyValue(value);
  const [warrantyType, setWarrantyType] = useState<WarrantyType>(parsed.type);
  const [amount, setAmount] = useState<number>(parsed.amount);
  const [unit, setUnit] = useState<WarrantyUnit>(parsed.unit);

  // Update parent when internal state changes
  useEffect(() => {
    const newValue = formatWarrantyValue(warrantyType, amount, unit);
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [warrantyType, amount, unit]);

  // Sync from parent value changes
  useEffect(() => {
    const parsed = parseWarrantyValue(value);
    setWarrantyType(parsed.type);
    if (parsed.type === 'custom') {
      setAmount(parsed.amount);
      setUnit(parsed.unit);
    }
  }, [value]);

  const handleTypeChange = (newType: WarrantyType) => {
    setWarrantyType(newType);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      setAmount(Math.min(val, unit === 'days' ? 365 : 36));
    }
  };

  const handleUnitChange = (newUnit: WarrantyUnit) => {
    setUnit(newUnit);
    // Adjust amount if exceeds max for new unit
    if (newUnit === 'months' && amount > 36) {
      setAmount(36);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Thời hạn bảo hành</Label>
      
      <RadioGroup
        value={warrantyType}
        onValueChange={(val) => handleTypeChange(val as WarrantyType)}
        className="space-y-3"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="none" id="warranty-none" />
          <Label htmlFor="warranty-none" className="font-normal cursor-pointer">
            ❌ Không bảo hành
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="warranty-custom" />
          <Label htmlFor="warranty-custom" className="font-normal cursor-pointer">
            🛡️ Có thời hạn:
          </Label>
          {warrantyType === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <Input
                type="number"
                min="1"
                max={unit === 'days' ? 365 : 36}
                value={amount}
                onChange={handleAmountChange}
                className="w-20 h-8"
              />
              <Select value={unit} onValueChange={(val) => handleUnitChange(val as WarrantyUnit)}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">ngày</SelectItem>
                  <SelectItem value="months">tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="lifetime" id="warranty-lifetime" />
          <Label htmlFor="warranty-lifetime" className="font-normal cursor-pointer">
            ♾️ Bảo hành trọn đời
          </Label>
        </div>
      </RadioGroup>
      
      <p className="text-xs text-muted-foreground">
        Thời gian bảo hành tính từ ngày thanh toán thành công. Người bán phải xử lý yêu cầu bảo hành trong 24 giờ.
      </p>
    </div>
  );
};

export default WarrantyPeriodInput;
