import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeGenerator } from './components/qr-code-generator';
import { QRCodeScanner } from './components/qr-code-scanner';
import { QRCodeBatch } from './components/qr-code-batch';
import { QRCodeList } from './components/qr-code-list';
import { QrCode, Scan, List, Layers } from 'lucide-react';

export function QRCodePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Code Management</h1>
        <p className="text-muted-foreground mt-1">
          Generate, scan, and manage QR codes for inventory items, locations, and assets
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="generate">
            <QrCode className="mr-2 h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="scan">
            <Scan className="mr-2 h-4 w-4" />
            Scan
          </TabsTrigger>
          <TabsTrigger value="batch">
            <Layers className="mr-2 h-4 w-4" />
            Batch
          </TabsTrigger>
          <TabsTrigger value="library">
            <List className="mr-2 h-4 w-4" />
            Library
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="generate">
            <QRCodeGenerator />
          </TabsContent>
          
          <TabsContent value="scan">
            <QRCodeScanner />
          </TabsContent>
          
          <TabsContent value="batch">
            <QRCodeBatch />
          </TabsContent>
          
          <TabsContent value="library">
            <QRCodeList />
          </TabsContent>
        </div>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>QR Code Best Practices</CardTitle>
          <CardDescription>
            Tips for creating effective QR codes for inventory management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Size & Placement</h3>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Minimum size should be 2 x 2 cm (0.8 x 0.8 inches)</li>
                <li>Place QR codes in easily accessible locations</li>
                <li>Avoid placing on curved surfaces when possible</li>
                <li>Ensure adequate lighting for scanning</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Content & Format</h3>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Keep data concise to reduce code complexity</li>
                <li>Use higher error correction for industrial environments</li>
                <li>Include essential information only</li>
                <li>Test QR codes before mass production</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Printing & Durability</h3>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Use high-quality printers for clear definition</li>
                <li>Consider weatherproof labels for warehouse environments</li>
                <li>Add a quiet zone (margin) around the QR code</li>
                <li>Print on non-reflective materials to avoid scanning issues</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}