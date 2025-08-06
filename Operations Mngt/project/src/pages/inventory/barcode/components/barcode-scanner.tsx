import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Smartphone, Keyboard, CheckCircle } from 'lucide-react';

export function BarcodeScanner() {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scannedItem, setScannedItem] = useState<any | null>(null);

  const handleStartScan = () => {
    setScanning(true);
    // In a real app, this would activate the camera and barcode scanning
    // For this demo, we'll simulate a scan after a short delay
    setTimeout(() => {
      const mockBarcode = 'ITEM-0187-LOT2023001';
      setScannedCode(mockBarcode);
      setScanning(false);
      
      // Simulate finding the item
      setScannedItem({
        itemCode: 'ITEM-0187',
        itemName: 'Printer Toner',
        batchNumber: 'LOT-2023-001',
        quantity: 120,
        location: 'Main Warehouse',
      });
    }, 2000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput) {
      setScannedCode(manualInput);
      
      // Simulate finding the item
      setScannedItem({
        itemCode: 'ITEM-0187',
        itemName: 'Printer Toner',
        batchNumber: 'LOT-2023-001',
        quantity: 120,
        location: 'Main Warehouse',
      });
    }
  };

  const handleReset = () => {
    setScannedCode(null);
    setScannedItem(null);
    setManualInput('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Barcode Scanner</CardTitle>
        <CardDescription>Scan barcodes to retrieve item information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {!scannedCode ? (
            <>
              <div className="flex space-x-2">
                <Button
                  variant={scanMode === 'camera' ? 'default' : 'outline'}
                  onClick={() => setScanMode('camera')}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </Button>
                <Button
                  variant={scanMode === 'manual' ? 'default' : 'outline'}
                  onClick={() => setScanMode('manual')}
                  className="flex-1"
                >
                  <Keyboard className="h-4 w-4 mr-2" />
                  Manual Input
                </Button>
              </div>

              {scanMode === 'camera' ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                    {scanning ? (
                      <>
                        <div className="animate-pulse mb-4">
                          <Camera className="h-12 w-12 text-primary" />
                        </div>
                        <p className="text-center font-medium">Scanning...</p>
                        <p className="text-center text-sm text-muted-foreground mt-1">
                          Position the barcode within the camera view
                        </p>
                      </>
                    ) : (
                      <>
                        <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-center font-medium">Camera Scanner</p>
                        <p className="text-center text-sm text-muted-foreground mt-1">
                          Click the button below to activate the camera and scan a barcode
                        </p>
                      </>
                    )}
                  </div>
                  <Button 
                    onClick={handleStartScan} 
                    disabled={scanning}
                    className="w-full"
                  >
                    {scanning ? 'Scanning...' : 'Start Scanning'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    You can also use a handheld scanner connected to your device
                  </p>
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manualInput">Enter Barcode</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="manualInput"
                        placeholder="Enter barcode manually"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                      />
                      <Button type="submit" disabled={!manualInput}>
                        Submit
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-800">Barcode Scanned Successfully</p>
              </div>
              
              <div className="p-4 border rounded-md">
                <p className="text-sm font-medium text-muted-foreground">Scanned Barcode:</p>
                <p className="font-medium">{scannedCode}</p>
              </div>
              
              {scannedItem && (
                <div className="space-y-4">
                  <h3 className="font-medium">Item Information:</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Item Code:</p>
                      <p className="font-medium">{scannedItem.itemCode}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Item Name:</p>
                      <p className="font-medium">{scannedItem.itemName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Batch Number:</p>
                      <p className="font-medium">{scannedItem.batchNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Quantity:</p>
                      <p className="font-medium">{scannedItem.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Location:</p>
                      <p className="font-medium">{scannedItem.location}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Scan Another
                </Button>
                <Button className="flex-1">
                  View Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}