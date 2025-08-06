import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarcodeGenerator } from './components/barcode-generator';
import { QRCodeGenerator } from './components/qr-code-generator';
import { BarcodeScanner } from './components/barcode-scanner';
import { BarcodeList } from './components/barcode-list';
import { QRCodeList } from './components/qr-code-list';
import { QRCodeBatch } from './components/qr-code-batch';
import { QrCode } from 'lucide-react';

export function BarcodePage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <QrCode className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Barcode Management</h1>
      </div>

      <Tabs defaultValue="generator">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full">
          <TabsTrigger value="generator">Barcode Generator</TabsTrigger>
          <TabsTrigger value="qr-generator">QR Code Generator</TabsTrigger>
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="batch">Batch Generator</TabsTrigger>
          <TabsTrigger value="barcode-list">Saved Barcodes</TabsTrigger>
          <TabsTrigger value="qr-list">Saved QR Codes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator" className="mt-6">
          <BarcodeGenerator />
        </TabsContent>
        
        <TabsContent value="qr-generator" className="mt-6">
          <QRCodeGenerator />
        </TabsContent>
        
        <TabsContent value="scanner" className="mt-6">
          <BarcodeScanner />
        </TabsContent>
        
        <TabsContent value="batch" className="mt-6">
          <QRCodeBatch />
        </TabsContent>
        
        <TabsContent value="barcode-list" className="mt-6">
          <BarcodeList />
        </TabsContent>
        
        <TabsContent value="qr-list" className="mt-6">
          <QRCodeList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BarcodePage;