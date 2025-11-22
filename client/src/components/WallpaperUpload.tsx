import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useSceneStore } from '../lib/stores/useSceneStore';

const DEFAULT_WALLPAPERS = [
  '/assets/wallpaper/cosmic1.jpg',
  '/assets/wallpaper/cosmic2.jpg',
  '/assets/wallpaper/cosmic3.jpg',
];

interface WallpaperUploadProps {
  onClose: () => void;
}

export function WallpaperUpload({ onClose }: WallpaperUploadProps) {
  const { settings, setCustomWallpaper } = useSceneStore();
  const [preview, setPreview] = useState<string | null>(settings.customWallpaper);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setCustomWallpaper(preview);
    onClose();
  };

  const handleSelectDefault = (url: string) => {
    setPreview(url);
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Customize Wallpaper</h2>
        <p className="text-purple-300/70">Upload your own image or choose from defaults</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-white font-semibold mb-3">Default Wallpapers</label>
          <div className="grid grid-cols-3 gap-3">
            {DEFAULT_WALLPAPERS.map((url, index) => (
              <button
                key={index}
                onClick={() => handleSelectDefault(url)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  preview === url ? 'border-purple-400 ring-2 ring-purple-400/50' : 'border-white/20'
                }`}
              >
                <img src={url} alt={`Wallpaper ${index + 1}`} className="w-full h-full object-cover" />
                {preview === url && (
                  <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                    <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Selected
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/20 pt-4">
          <label className="block text-white font-semibold mb-3">Upload Custom Image</label>
          <div className="flex gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            {preview && preview.startsWith('data:') && (
              <Button
                onClick={handleClear}
                variant="outline"
                className="bg-white/10 border-white/20 hover:bg-white/20"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {preview && (
          <div className="space-y-3">
            <label className="block text-white font-semibold">Preview</label>
            <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-purple-400/50">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white">
                <ImageIcon className="h-3 w-3 inline mr-1" />
                Preview
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-white/20">
        <Button
          onClick={handleSave}
          disabled={!preview}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
        >
          Save Wallpaper
        </Button>
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 bg-white/10 border-white/20 hover:bg-white/20"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
