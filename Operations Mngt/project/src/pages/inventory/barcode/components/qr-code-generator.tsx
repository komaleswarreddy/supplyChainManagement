import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Printer, Download, Copy } from 'lucide-react';

export function QRCodeGenerator() {
  const [qrData, setQrData] = useState('');
  const [qrSize, setQrSize] = useState(200);
  const [errorCorrection, setErrorCorrection] = useState('M');
  const [qrColor, setQrColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [includeLabel, setIncludeLabel] = useState(true);
  const [labelText, setLabelText] = useState('');
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    if (qrData) {
      setGenerated(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
        <CardDescription>Create and print custom QR codes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="qrData">QR Code Data</Label>
              <Textarea
                id="qrData"
                placeholder="Enter text, URL, or data for the QR code"
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                className="h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qrSize">Size (px)</Label>
              <Input
                id="qrSize"
                type="number"
                min={100}
                max={500}
                value={qrSize}
                onChange={(e) => setQrSize(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="errorCorrection">Error Correction</Label>
              <Select
                id="errorCorrection"
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value)}
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qrColor">QR Code Color</Label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  id="qrColor"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-10 h-10 rounded border"
                />
                <Input
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  id="backgroundColor"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-10 rounded border"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="includeLabel"
                checked={includeLabel}
                onChange={(e) => setIncludeLabel(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="includeLabel">Include Label</Label>
            </div>
            {includeLabel && (
              <div className="space-y-2">
                <Label htmlFor="labelText">Label Text</Label>
                <Input
                  id="labelText"
                  placeholder="Enter label text (optional)"
                  value={labelText}
                  onChange={(e) => setLabelText(e.target.value)}
                />
              </div>
            )}
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={!qrData}
            className="w-full"
          >
            Generate QR Code
          </Button>

          {generated && (
            <div className="space-y-4">
              <div className="border rounded-md p-6 flex flex-col items-center justify-center">
                {/* This would be a real QR code in a production app */}
                <div 
                  className="bg-gray-200 flex items-center justify-center"
                  style={{ width: `${qrSize}px`, height: `${qrSize}px`, maxWidth: '100%' }}
                >
                  <p className="text-center text-gray-600">QR Code: {qrData}</p>
                  <p className="text-center text-gray-600 text-xs">
                    (This is a placeholder - in a real app, a QR code would be rendered here)
                  </p>
                </div>
                {includeLabel && labelText && (
                  <p className="mt-2 text-center">{labelText}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}