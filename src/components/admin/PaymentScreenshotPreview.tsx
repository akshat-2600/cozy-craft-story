import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentScreenshotPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screenshotPath: string | null;
}

export const PaymentScreenshotPreview = ({
  open,
  onOpenChange,
  screenshotPath,
}: PaymentScreenshotPreviewProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      if (!screenshotPath || !open) {
        setSignedUrl(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Extract just the file path from the full URL if needed
        let filePath = screenshotPath;
        if (screenshotPath.includes("/payment-screenshots/")) {
          filePath = screenshotPath.split("/payment-screenshots/").pop() || screenshotPath;
        }

        // Generate a signed URL valid for 5 minutes
        const { data, error: signError } = await supabase.storage
          .from("payment-screenshots")
          .createSignedUrl(filePath, 300);

        if (signError) {
          throw signError;
        }

        setSignedUrl(data.signedUrl);
      } catch (err: any) {
        console.error("Error generating signed URL:", err);
        setError(err.message || "Failed to load payment screenshot");
      } finally {
        setLoading(false);
      }
    };

    getSignedUrl();
  }, [screenshotPath, open]);

  const isPdf = screenshotPath?.toLowerCase().endsWith(".pdf");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Payment Screenshot</DialogTitle>
        </DialogHeader>
        <div className="relative min-h-[60vh]">
          {loading ? (
            <div className="flex h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex h-[60vh] items-center justify-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : signedUrl ? (
            <>
              {isPdf ? (
                <iframe
                  src={signedUrl}
                  className="h-[60vh] w-full rounded-lg border"
                  title="Payment Screenshot"
                />
              ) : (
                <img
                  src={signedUrl}
                  alt="Payment Screenshot"
                  className="mx-auto max-h-[60vh] rounded-lg object-contain"
                />
              )}
              <div className="mt-4 flex justify-center">
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </Button>
                </a>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
