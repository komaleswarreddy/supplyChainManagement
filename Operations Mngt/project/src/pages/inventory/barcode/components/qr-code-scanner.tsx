import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Smartphone, Copy, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function QRCodeScanner() {
  const [activeTab, setActiveTab] = useState('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [dataType, setDataType] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mock function to simulate QR code scanning
  const mockScanQRCode = () => {
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      const mockResults = [
        { type: 'product', data: JSON.stringify({
          sku: 'PROD12345',
          name: 'Wireless Headphones',
          description: 'Noise cancelling wireless headphones',
          price: '149.99',
          category: 'Electronics',
          location: 'Warehouse A, Shelf B12',
          expiryDate: '2025-12-31'
        })},
        { type: 'url', data: 'https://example.com/product/12345' },
        { type: 'text', data: 'Batch #A12345 - Manufactured on 2023-06-15' },
        { type: 'contact', data: `BEGIN:VCARD
VERSION:3.0
N:Smith;John
ORG:Acme Corporation
TITLE:Warehouse Manager
TEL:+1-555-123-4567
EMAIL:john.smith@example.com
URL:https://example.com
ADR:123 Main St, Anytown, CA 12345
END:VCARD` },
      ];
      
      // Select a random result
      const result = mockResults[Math.floor(Math.random() * mockResults.length)];
      setScannedResult(result.data);
      setDataType(result.type);
      
      try {
        if (result.type === 'product') {
          setParsedData(JSON.parse(result.data));
        } else if (result.type === 'contact') {
          // Parse vCard format
          const vCardLines = result.data.split('\n');
          const parsedContact: Record<string, string> = {};
          
          vCardLines.forEach(line => {
            if (line.includes(':')) {
              const [key, value] = line.split(':');
              if (!['BEGIN', 'END', 'VERSION'].includes(key)) {
                parsedContact[key] = value;
              }
            }
          });
          
          setParsedData(parsedContact);
        } else {
          setParsedData(null);
        }
      } catch (error) {
        console.error('Error parsing QR code data:', error);
        setParsedData(null);
      }
      
      setIsScanning(false);
      toast.success('QR code scanned successfully!');
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        // In a real implementation, we would process the image to scan for QR codes
        // For this mock, we'll just simulate a scan after a delay
        setTimeout(() => {
          mockScanQRCode();
        }, 1000);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsScanning(true);
          
          // In a real implementation, we would continuously scan for QR codes
          // For this mock, we'll just simulate a scan after a delay
          setTimeout(() => {
            mockScanQRCode();
            
            // Stop the camera after scanning
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            if (videoRef.current) {
              videoRef.current.srcObject = null;
            }
          }, 3000);
        }
      } else {
        toast.error('Camera access not supported by your browser');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const copyToClipboard = () => {
    if (scannedResult) {
      navigator.clipboard.writeText(scannedResult)
        .then(() => {
          setIsCopied(true);
          toast.success('Copied to clipboard!');
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy:', err);
          toast.error('Failed to copy to clipboard');
        });
    }
  };

  const resetScan = () => {
    setScannedResult(null);
    setParsedData(null);
    setDataType(null);
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup function to stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>
            Scan QR codes from camera or uploaded images
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!scannedResult ? (
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="camera">
                    <Camera className="mr-2 h-4 w-4" />
                    Camera
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="camera" className="space-y-4 mt-4">
                  <div className="relative aspect-square max-w-md mx-auto border rounded-lg overflow-hidden bg-black">
                    {isScanning ? (
                      <>
                        <video 
                          ref={videoRef} 
                          className="w-full h-full object-cover"
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3/4 h-3/4 border-2 border-white/50 rounded-lg"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-pulse text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                            Scanning...
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">Camera preview will appear here</p>
                        <Button onClick={startCamera}>
                          <Camera className="mr-2 h-4 w-4" />
                          Start Camera
                        </Button>
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4 mt-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {uploadedImage ? (
                      <div className="relative max-w-md mx-auto">
                        <img 
                          src={uploadedImage} 
                          alt="Uploaded QR code" 
                          className="max-w-full max-h-64 mx-auto"
                        />
                        {isScanning && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="animate-pulse text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                              Processing...
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Drag and drop an image file here, or click to select a file
                        </p>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="qr-file-upload"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Select Image
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Scan Result</h3>
                <Button variant="ghost" size="sm" onClick={resetScan}>
                  Scan Another
                </Button>
              </div>

              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">Type:</span>
                    <Badge variant="secondary" className="capitalize">
                      {dataType || 'Text'}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="h-8"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                {dataType === 'product' && parsedData ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">SKU:</span> {parsedData.sku}
                      </div>
                      <div>
                        <span className="font-medium">Name:</span> {parsedData.name}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Description:</span> {parsedData.description}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> ${parsedData.price}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {parsedData.category}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Location:</span> {parsedData.location}
                      </div>
                      {parsedData.expiryDate && (
                        <div>
                          <span className="font-medium">Expiry Date:</span> {parsedData.expiryDate}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button size="sm">View in Inventory</Button>
                    </div>
                  </div>
                ) : dataType === 'contact' && parsedData ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {parsedData.N}
                      </div>
                      <div>
                        <span className="font-medium">Organization:</span> {parsedData.ORG}
                      </div>
                      <div>
                        <span className="font-medium">Title:</span> {parsedData.TITLE}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {parsedData.TEL}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {parsedData.EMAIL}
                      </div>
                      <div>
                        <span className="font-medium">Website:</span> {parsedData.URL}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Address:</span> {parsedData.ADR}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button size="sm" variant="outline">Add to Contacts</Button>
                      <Button size="sm">Send Email</Button>
                    </div>
                  </div>
                ) : dataType === 'url' ? (
                  <div className="space-y-2">
                    <p className="text-sm break-all">{scannedResult}</p>
                    <div className="flex justify-end mt-2">
                      <Button 
                        size="sm" 
                        onClick={() => window.open(scannedResult, '_blank')}
                      >
                        Open URL
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm break-all whitespace-pre-wrap">{scannedResult}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={resetScan}>
                  Scan New Code
                </Button>
                <Button onClick={copyToClipboard}>
                  {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
          <CardDescription>
            Recent QR codes you've scanned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Mock scan history */}
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Product: Wireless Headphones</p>
                  <p className="text-xs text-muted-foreground">Scanned 2 minutes ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">URL: https://example.com/product/12345</p>
                  <p className="text-xs text-muted-foreground">Scanned 15 minutes ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Contact: John Smith</p>
                  <p className="text-xs text-muted-foreground">Scanned 1 hour ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}