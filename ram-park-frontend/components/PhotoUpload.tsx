'use client';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { uploadPhoto } from '@/lib/api';
import { Camera, Upload, CheckCircle, XCircle } from 'lucide-react';

interface PhotoUploadProps {
  lotId: string;
  onUploadComplete?: () => void;
}

export function PhotoUpload({ lotId, onUploadComplete }: PhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid image file');
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError('');
    
    try {
      const response = await uploadPhoto(lotId, selectedFile);
      setResult(response);
      onUploadComplete?.();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [selectedFile, lotId, onUploadComplete]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
    setError('');
  }, []);

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="pb-4">
        <h2 className="text-2xl font-bold text-center">📸 Photo Upload</h2>
        <p className="text-center text-gray-600 text-sm">Lot {lotId.toUpperCase()}</p>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id={`photo-upload-${lotId}`}
              disabled={uploading}
            />
            <label htmlFor={`photo-upload-${lotId}`} className="cursor-pointer block">
              <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-all">
                <Camera className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-lg font-semibold mb-2 text-gray-700 group-hover:text-blue-600">
                {selectedFile ? 'Change photo' : 'Click to upload'}
              </p>
              {selectedFile ? (
                <p className="text-sm text-blue-600">{selectedFile.name}</p>
              ) : (
                <p className="text-sm text-gray-500">Supports JPG, PNG (max 10MB)</p>
              )}
            </label>
          </div>

          {/* File Preview */}
          {selectedFile && (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-blue-200">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg shadow-md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="h-10 w-10 p-0"
              >
                <XCircle className="w-5 h-5 text-red-500" />
              </Button>
            </div>
          )}

          {/* Button */}
          {selectedFile && !uploading && (
            <Button
              size="lg"
              className="w-full h-14 text-lg"
              onClick={handleUpload}
              disabled={uploading}
            >
              <Upload className="w-5 h-5 mr-2" />
              Simulate AI Detection
            </Button>
          )}

          {/* Loading */}
          {uploading && (
            <div className="flex items-center space-x-3 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              <div>
                <p className="font-semibold text-blue-900">Processing with AI...</p>
                <p className="text-sm text-blue-700">Analyzing parking spots</p>
              </div>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h3 className="text-xl font-bold text-green-900">AI Analysis Complete!</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Detected Occupancy:</span>
                  <div className="text-2xl font-bold text-green-600 ml-2">{result.photoOccupancy}%</div>
                </div>
                {result.totalSpots && (
                  <div>
                    <span className="font-semibold text-gray-700">Total Spots:</span>
                    <div className="text-lg font-bold text-gray-900 ml-2">{result.totalSpots}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fail */}
          {error && (
            <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <span className="font-semibold text-red-900">{error}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}