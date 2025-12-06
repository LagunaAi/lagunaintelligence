import { useRef, useState, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Copy, Check } from "lucide-react";
import lagunaLogo from "@/assets/laguna-logo.jpg";
import { toast } from "sonner";

export default function QRCodePage() {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  
  const baseUrl = window.location.origin;
  const demoUrl = `${baseUrl}/demo`;

  const handleDownload = useCallback(() => {
    if (!qrRef.current) return;
    
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'laguna-demo-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success("QR code downloaded!");
  }, []);

  const handleCopyUrl = useCallback(async () => {
    await navigator.clipboard.writeText(demoUrl);
    setCopied(true);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [demoUrl]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={lagunaLogo} 
              alt="Laguna" 
              className="h-12 w-12 rounded-lg object-cover"
            />
          </div>
          <CardTitle className="text-2xl">Try Laguna Demo</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Scan to experience our water risk assessment platform
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div 
            ref={qrRef}
            className="border-4 border-primary rounded-lg p-4 bg-white"
          >
            <QRCodeCanvas 
              value={demoUrl}
              size={256}
              level="H"
              marginSize={2}
            />
          </div>
          
          <p className="text-center text-lg font-medium text-primary">
            Scan to try Laguna
          </p>
          
          <div 
            className="bg-muted rounded-lg px-4 py-2 text-sm font-mono break-all text-center cursor-pointer hover:bg-muted/80 transition-colors flex items-center gap-2"
            onClick={handleCopyUrl}
          >
            <span className="flex-1">{demoUrl}</span>
            {copied ? (
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          
          <div className="flex gap-3 w-full">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button onClick={handleCopyUrl} variant="outline" className="flex-1">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              Copy URL
            </Button>
          </div>
          
          <div className="text-center space-y-2 pt-4 border-t w-full">
            <p className="text-sm font-medium">Arizona Semiconductor Demo</p>
            <p className="text-xs text-muted-foreground">
              A realistic risk assessment for a semiconductor fab in Phoenix, AZ facing Colorado River water shortages.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
