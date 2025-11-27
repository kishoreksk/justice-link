import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2, Maximize2, Minimize2, X, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFViewerProps {
  disputeId: string;
  pdfUrl?: string;
  onClose?: () => void;
}

export const PDFViewer = ({ disputeId, pdfUrl, onClose }: PDFViewerProps) => {
  const [loading, setLoading] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(viewUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
            <iframe
              src={viewUrl}
              className={`w-full border rounded ${isFullscreen ? 'h-[calc(100vh-160px)]' : 'h-[600px]'}`}
              title="Award Document"
            />
          </div>
        ) : (
          <Button onClick={loadPDF}>Load PDF</Button>
        )}
      </CardContent>
    </Card>
  );
};
