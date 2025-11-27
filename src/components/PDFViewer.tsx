import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2, Maximize2, Minimize2, X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  disputeId: string;
  pdfUrl?: string;
  onClose?: () => void;
}

export const PDFViewer = ({ disputeId, pdfUrl, onClose }: PDFViewerProps) => {
  const [loading, setLoading] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const { toast } = useToast();

  useEffect(() => {
    if (pdfUrl) {
      loadPDF();
    }
  }, [pdfUrl]);

  const loadPDF = async () => {
    if (!pdfUrl) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('case-documents')
        .download(pdfUrl);

      if (error) throw error;
      
      const blobUrl = URL.createObjectURL(data);
      setViewUrl(blobUrl);
    } catch (error: any) {
      console.error('Error loading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to load PDF document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('case-documents')
        .download(pdfUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `case-${disputeId}-award.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "PDF downloaded successfully"
      });
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      });
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => {
    changePage(-1);
  };

  const nextPage = () => {
    changePage(1);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.5));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  if (!pdfUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Award Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No award document has been issued yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Award Document
          </span>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              variant="outline" 
              size="sm"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            {onClose && (
              <Button 
                onClick={onClose} 
                variant="outline" 
                size="sm"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : viewUrl ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousPage}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm whitespace-nowrap">
                  Page {pageNumber} of {numPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={pageNumber >= numPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
                  title="Zoom Out"
                >
                  -
                </Button>
                <span className="text-sm whitespace-nowrap min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomIn}
                  disabled={scale >= 2.5}
                  title="Zoom In"
                >
                  +
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetZoom}
                  title="Reset Zoom"
                >
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(viewUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Open in New Tab</span>
                </Button>
              </div>
            </div>
            <div className={`border rounded overflow-auto ${isFullscreen ? 'h-[calc(100vh-240px)]' : 'h-[500px] sm:h-[600px]'} flex items-center justify-center bg-muted/20`}>
              <Document
                file={viewUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center h-96 gap-4">
                    <p className="text-muted-foreground">Failed to load PDF</p>
                    <Button onClick={() => window.open(viewUrl, '_blank')}>
                      Open in New Tab
                    </Button>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            </div>
          </div>
        ) : (
          <Button onClick={loadPDF}>Load PDF</Button>
        )}
      </CardContent>
    </Card>
  );
};
