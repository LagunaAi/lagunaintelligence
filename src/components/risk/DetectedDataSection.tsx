import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, AlertTriangle, Pencil, X } from "lucide-react";

interface DetectedField {
  label: string;
  value: string | number;
  confidence: 'stated' | 'inferred';
  key: string;
  editable?: boolean;
  options?: string[];
}

interface DetectedDataSectionProps {
  fields: DetectedField[];
  onFieldUpdate?: (key: string, value: string | number) => void;
}

const DetectedDataSection = ({ fields, onFieldUpdate }: DetectedDataSectionProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleEdit = (field: DetectedField) => {
    setEditingField(field.key);
    setEditValue(String(field.value));
  };

  const handleSave = (key: string) => {
    if (onFieldUpdate) {
      onFieldUpdate(key, editValue);
    }
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const formatValue = (value: string | number, key: string) => {
    if (key === 'estimatedWaterConsumption' && typeof value === 'number') {
      return `${(value / 1000000).toFixed(1)}M m³/year`;
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return String(value);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          What We Detected
          <Badge variant="outline" className="font-normal text-xs">
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.key} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-36">{field.label}:</span>
                
                {editingField === field.key ? (
                  <div className="flex items-center gap-2">
                    {field.options ? (
                      <Select value={editValue} onValueChange={setEditValue}>
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8 w-[180px]"
                      />
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSave(field.key)}>
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancel}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <span className="font-medium">{formatValue(field.value, field.key)}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {field.confidence === 'stated' ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Check className="h-3 w-3 mr-1" />
                    Stated
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Inferred
                  </Badge>
                )}
                
                {field.editable !== false && editingField !== field.key && onFieldUpdate && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleEdit(field)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          Inferred values are based on industry benchmarks. Click the pencil icon to correct any assumptions.
        </p>
      </CardContent>
    </Card>
  );
};

export default DetectedDataSection;
