import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFViewerProps {
  disputeId: string;
  pdfUrl?: string;
}

export const PDFViewer = ({ disputeId, pdfUrl }: PDFViewerProps) => {
  const [loading, setLoading] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
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
        .createSignedUrl(pdfUrl, 3600); // 1 hour expiry

      if (error) throw error;
      
      setViewUrl(data.signedUrl);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Award Document
          </span>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : viewUrl ? (
          <iframe
            src={viewUrl}
            className="w-full h-[600px] border rounded"
            title="Award Document"
          />
        ) : (
          <Button onClick={loadPDF}>Load PDF</Button>
        )}
      </CardContent>
    </Card>
  );
};
