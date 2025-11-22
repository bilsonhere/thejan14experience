import { useState } from 'react';
import { Share2, Download, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export function ShareButton() {
  const [capturing, setCapturing] = useState(false);
  const [copied, setCopied] = useState(false);

  const captureScreenshot = async () => {
    try {
      setCapturing(true);
      
      const element = document.body;
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });

      return canvas;
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return null;
    } finally {
      setCapturing(false);
    }
  };

  const downloadImage = async () => {
    const canvas = await captureScreenshot();
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `afrah20-birthday-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const shareTwitter = async () => {
    const text = encodeURIComponent("🎂 Celebrating Afrah's 20th Birthday! 🎉 #AFRAH20 #BirthdayCelebration");
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank');
  };

  const shareFacebook = async () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          disabled={capturing}
          className="backdrop-blur-sm bg-black/30 hover:bg-black/50 text-white border border-white/20"
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="backdrop-blur-md bg-black/80 text-white border-white/20">
        <DropdownMenuItem onClick={downloadImage} disabled={capturing}>
          <Download className="h-4 w-4 mr-2" />
          {capturing ? 'Capturing...' : 'Save Screenshot'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareTwitter}>
          <span className="mr-2">🐦</span>
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareFacebook}>
          <span className="mr-2">📘</span>
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <span className="mr-2">🔗</span>
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
