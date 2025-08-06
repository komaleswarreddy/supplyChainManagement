import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Printer, Download } from 'lucide-react';

export function QRCodeBatch() {
  const [batchType, setBatchType] = useState('csv');
  const [csvData, setCsvData] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [startNumber, setStartNumber] = useState(1);
  const [endNumber, setEndNumber] = useState(10);
  const [digitCount, setDigitCount] = useState(4);
  const [qrSize, setQrSize] = useState(150);
  const [includeText, setIncludeText] = useState(true);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerated(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch QR Code Generator</CardTitle>
        <CardDescription>Generate multiple QR codes at once</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batchType">Batch Type</Label>
              <Select
                id="batchType"
                value={batchType}
                onChange={(e) => setBatchType(e.target.value)}
              >
                <option value="csv">CSV Data</option>
                <option value="sequence">Sequential Numbers</option>
                <option value="file">Upload File</option>
              </Select>
            </div>

            {batchType === 'csv' && (
              <div className="space-y-2">
                <Label htmlFor="csvData">CSV Data (one entry per line)</Label>
                <Textarea
                  id="csvData"
                  placeholder="Enter data, one entry per line"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  className="h-32"
                />
                <p className="text-xs text-muted-foreground">
                  Example: ITEM-001, Item Description<br />
                  ITEM-002, Another Item
                </p>
              </div>
            )}

            {batchType === 'sequence' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prefix">Prefix</Label>
                    <Input
                      id="prefix"
                      placeholder="e.g., ITEM-"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="suffix">Suffix</Label>
                    <Input
                      id="suffix"
                      placeholder="e.g., -2023"
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startNumber">Start Number</Label>
                    <Input
                      id="startNumber"
                      type="number"
                      min={0}
                      value={startNumber}
                      onChange={(e) => setStartNumber(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endNumber">End Number</Label>
                    <Input
                      id="endNumber"
                      type="number"
                      min={startNumber}
                      value={endNumber}
                      onChange={(e) => setEndNumber(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="digitCount">Digit Count</Label>
                    <Input
                      id="digitCount"
                      type="number"
                      min={1}
                      max={10}
                      value={digitCount}
                      onChange={(e) => setDigitCount(parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium">Preview:</p>
                  <p className="mt-1">
                    {prefix}{String(startNumber).padStart(digitCount, '0')}{suffix} to {prefix}{String(endNumber).padStart(digitCount, '0')}{suffix}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Total: {endNumber - startNumber + 1} QR codes will be generated
                  </p>
                </div>
              </div>
            )}

            {batchType === 'file' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Drag and drop a file here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: CSV, TXT, XLSX (max 5MB)
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Browse Files
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The file should contain one data entry per line or in a single column
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qrSize">QR Code Size (px)</Label>
                <Input
                  id="qrSize"
                  type="number"
                  min={50}
                  max={300}
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="includeText"
                  checked={includeText}
                  onChange={(e) => setIncludeText(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="includeText">Include Text Below QR Codes</Label>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={(batchType === 'csv' && !csvData) || 
                     (batchType === 'sequence' && endNumber < startNumber)}
            className="w-full"
          >
            Generate Batch QR Codes
          </Button>

          {generated && (
            <div className="space-y-4">
              <div className="border rounded-md p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* This would show actual QR codes in a real app */}
                  {Array.from({ length: Math.min(8, batchType === 'sequence' ? endNumber - startNumber + 1 : 8) }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="bg-gray-200 flex items-center justify-center"
                        style={{ width: `${qrSize}px`, height: `${qrSize}px`, maxWidth: '100%' }}
                      >
                        <p className="text-center text-gray-600 text-xs">
                          QR Code {index + 1}
                        </p>
                      </div>
                      {includeText && (
                        <p className="mt-2 text-center text-sm">
                          {batchType === 'sequence' 
                            ? `${prefix}${String(startNumber + index).padStart(digitCount, '0')}${suffix}`
                            : `Item ${index + 1}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {batchType === 'sequence' && endNumber - startNumber + 1 > 8 && (
                  <p className="text-center mt-4 text-sm text-muted-foreground">
                    Showing 8 of {endNumber - startNumber + 1} QR codes
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print All
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download ZIP
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}