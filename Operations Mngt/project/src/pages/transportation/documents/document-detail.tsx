import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTransportation } from '@/hooks/useTransportation';
import { ArrowLeft, FileCheck, Printer, ExternalLink, Download } from 'lucide-react';

export function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useDocument } = useTransportation();
  const { data: document, isLoading } = useDocument(id!);

  if (isLoading || !document) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/transportation/documents')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <FileCheck className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{document.type.replace('_', ' ')}</h1>
                <p className="text-sm text-muted-foreground">
                  {document.documentNumber}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.open(document.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              View
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.open(document.url, '_blank')}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Document Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Document Type</h3>
                    <p className="mt-1">
                      <Badge variant="secondary">
                        {document.type.replace('_', ' ')}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Document Number</h3>
                    <p className="mt-1 font-medium">{document.documentNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Issued Date</h3>
                    <p className="mt-1">{format(new Date(document.issuedDate), 'PP')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Issued By</h3>
                    <p className="mt-1">{document.issuedBy.name}</p>
                  </div>
                  {document.signedBy && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Signed By</h3>
                      <p className="mt-1">{document.signedBy}</p>
                    </div>
                  )}
                  {document.signatureDate && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Signature Date</h3>
                      <p className="mt-1">{format(new Date(document.signatureDate), 'PP')}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Shipment ID</h3>
                    <p className="mt-1">
                      <Button 
                        variant="link" 
                        className="p-0 h-auto"
                        onClick={() => navigate(`/transportation/shipments/${document.shipmentId}`)}
                      >
                        {document.shipmentId}
                      </Button>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Document Preview</h2>
                <div className="aspect-[8.5/11] bg-muted rounded-lg flex flex-col items-center justify-center p-6">
                  <div className="w-full h-full border-2 border-dashed border-muted-foreground rounded-lg p-8 flex flex-col">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-bold">{document.type.replace('_', ' ')}</h3>
                      <p className="text-sm text-muted-foreground">{document.documentNumber}</p>
                    </div>
                    
                    {document.data && (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <h4 className="text-sm font-medium">Shipment Number</h4>
                            <p>{document.data.shipmentNumber}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Carrier</h4>
                            <p>{document.data.carrierName}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <h4 className="text-sm font-medium">Origin</h4>
                            <p className="text-sm">{document.data.originAddress}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Destination</h4>
                            <p className="text-sm">{document.data.destinationAddress}</p>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-sm font-medium mb-2">Items</h4>
                          <table className="w-full text-sm">
                            <thead className="border-b">
                              <tr>
                                <th className="text-left py-1">Description</th>
                                <th className="text-right py-1">Quantity</th>
                                <th className="text-right py-1">Weight</th>
                              </tr>
                            </thead>
                            <tbody>
                              {document.data.items?.map((item: any, index: number) => (
                                <tr key={index} className="border-b">
                                  <td className="py-1">{item.description}</td>
                                  <td className="text-right py-1">{item.quantity}</td>
                                  <td className="text-right py-1">{item.weight}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {document.type === 'BOL' && document.signedBy && (
                          <div className="mt-auto pt-6 border-t">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="text-sm font-medium">Signed By</h4>
                                <p>{document.signedBy}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Date</h4>
                                <p>{document.signatureDate ? format(new Date(document.signatureDate), 'PP') : ''}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  This is a preview. Click "View" to see the full document.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Document Actions</h2>
                <div className="space-y-3">
                  <Button 
                    className="w-full flex items-center gap-2"
                    onClick={() => window.open(document.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Document
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print Document
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => window.open(document.url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                    Download Document
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Related Information</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Shipment</h3>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto mt-1"
                      onClick={() => navigate(`/transportation/shipments/${document.shipmentId}`)}
                    >
                      View Shipment Details
                    </Button>
                  </div>
                  
                  {document.type === 'BOL' && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Carrier</h3>
                      <p className="mt-1">{document.data?.carrierName}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                    <p className="mt-1">{format(new Date(document.createdAt), 'PPp')}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                    <p className="mt-1">{format(new Date(document.updatedAt), 'PPp')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}