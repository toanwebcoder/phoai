'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, RotateCw, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getBase64Size, formatBytes } from '@/lib/imageCompression';
import { useLanguage } from '@/contexts/LanguageContext';

interface CameraProps {
  onCapture: (imageBase64: string) => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE_MB = 10; // 10MB upload limit
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function Camera({ onCapture, isLoading = false }: CameraProps) {
  const { t } = useLanguage();
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      // Convert base64 to just the data part (remove data:image/jpeg;base64,)
      const base64Data = imageSrc.split(',')[1];
      onCapture(base64Data);
    }
  }, [onCapture]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setError(null);
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Clear previous error
      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(t.camera.errorInvalidFile);
        return;
      }

      // Validate file size (check actual file size first)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(
          `${t.camera.errorTooLarge} (${formatBytes(file.size)}). ${t.camera.sizeLimit} ${MAX_FILE_SIZE_MB}MB`
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];

        // Double check base64 size
        const base64Size = getBase64Size(base64Data);
        if (base64Size > MAX_FILE_SIZE_BYTES) {
          setError(
            `${t.camera.errorAfterConvert} (${formatBytes(base64Size)}). ${t.camera.sizeLimit} ${MAX_FILE_SIZE_MB}MB`
          );
          return;
        }

        setCapturedImage(result);
        onCapture(base64Data);
      };

      reader.onerror = () => {
        setError(t.camera.errorReadFile);
      };

      reader.readAsDataURL(file);
    },
    [onCapture, t]
  );

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-black">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode,
              aspectRatio: 4 / 3,
            }}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-t border-red-200">
          <div className="flex items-center gap-2 text-red-800 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {!capturedImage ? (
          <div className="flex gap-2">
            <Button onClick={capture} className="flex-1" size="lg" disabled={isLoading}>
              <CameraIcon className="mr-2 h-5 w-5" />
              {t.camera.takePhoto}
            </Button>
            <Button onClick={switchCamera} variant="outline" size="lg" disabled={isLoading}>
              <RotateCw className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Button onClick={retake} variant="outline" className="w-full" size="lg" disabled={isLoading}>
            {t.camera.retake}
          </Button>
        )}

        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isLoading}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            <Upload className="mr-2 h-5 w-5" />
            {t.camera.uploadImage}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            {t.camera.sizeLimit} {MAX_FILE_SIZE_MB}MB
          </p>
        </div>
      </div>
    </Card>
  );
}
