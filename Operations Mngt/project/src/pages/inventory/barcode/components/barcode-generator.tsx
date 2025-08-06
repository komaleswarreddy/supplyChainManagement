import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Printer, Download, Copy } from 'lucide-react';

export function BarcodeGenerator() {
  const [barcodeData, setBarcodeData] = useState('');
  const [barcodeType, setBarcodeType] = useState('CODE128');
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const [showText, setShowText] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    if (barcodeData) {
      setGenerated(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Barcode Generator</CardTitle>
        <CardDescription>Create and print custom barcodes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcodeData">Barcode Data</Label>
              <Input
                id="barcodeData"
                placeholder="Enter barcode data"
                value={barcodeData}
                onChange={(e) => setBarcodeData(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcodeType">Barcode Type</Label>
              <Select
                id="barcodeType"
                value={barcodeType}
                onChange={(e) => setBarcodeType(e.target.value)}
              >
                <option value="CODE128">Code 128</option>
                <option value="CODE39">Code 39</option>
                <option value="EAN13">EAN-13</option>
                <option value="UPC">UPC</option>
                <option value="EAN8">EAN-8</option>
                <option value="ITF14">ITF-14</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcodeWidth">Bar Width (px)</Label>
              <Input
                id="barcodeWidth"
                type="number"
                min={1}
                max={5}
                value={barcodeWidth}
                onChange={(e) => setBarcodeWidth(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcodeHeight">Height (px)</Label>
              <Input
                id="barcodeHeight"
                type="number"
                min={50}
                max={200}
                value={barcodeHeight}
                onChange={(e) => setBarcodeHeight(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size (px)</Label>
              <Input
                id="fontSize"
                type="number"
                min={8}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                disabled={!showText}
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="showText"
                checked={showText}
                onChange={(e) => setShowText(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="showText">Show Text</Label>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={!barcodeData}
            className="w-full"
          >
            Generate Barcode
          </Button>

          {generated && (
            <div className="space-y-4">
              <div className="border rounded-md p-6 flex flex-col items-center justify-center">
                {/* This would be a real barcode in a production app */}
                <div className="bg-gray-200 w-full h-24 flex items-center justify-center">
                  <p className="text-center text-gray-600">Barcode: {barcodeData}</p>
                  <p className="text-center text-gray-600 text-xs">
                    (This is a placeholder - in a real app, a barcode would be rendered here)
                  </p>
                </div>
                {showText && (
                  <p className="mt-2" style={{ fontSize: `${fontSize}px` }}>{barcodeData}</p>
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