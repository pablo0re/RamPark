// 'use client';
// import { useState, useCallback } from 'react';
// import { Card } from '@/components/ui/Card';
// import { Button } from '@/components/ui/Button';
// import { uploadPhoto } from '@/lib/api';
// import { CheckCircle, XCircle, Camera, Upload } from 'lucide-react';

// export function PhotoUpload() {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [result, setResult] = useState<any>(null);
//   const [error, setError] = useState('');

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file && file.type.startsWith('image/')) {
//       setSelectedFile(file);
//       setError('');
//     } else {
//       setError('Please select a valid image file');
//     }
//   };

//   const handleUpload = useCallback(async () => {
//     if (!selectedFile) return;
    
//     setUploading(true);
//     setError('');
    
//     try {
//       const lotId = selectedFile.name.includes('15A') ? 'lot15A' : 'lot15';
//       const response = await uploadPhoto(lotId, selectedFile);
//       setResult(response);
//     } catch (err: any) {
//       setError(err.message || 'Upload failed');
//     } finally {
//       setUploading(false);
//     }
//   }, [selectedFile]);

//   return (
//     <Card className="p-8">
//       <div className="text-center mb-8">
//         <h2 className="text-2xl font-bold mb-2">Upload Parking Photo</h2>
//         <p className="text-slate-400">Drop an image of Lot 15 or Lot 15A</p>
//       </div>

//       <div className="space-y-6">
//         <div
//           className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer group"
//           onDrop={(e) => {
//             e.preventDefault();
//             const file = e.dataTransfer.files[0];
//             if (file) {
//               const event = { target: { files: [file] } } as any;
//               handleFileSelect(event);
//             }
//           }}
//           onDragOver={(e) => e.preventDefault()}
//         >
//           <div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
//             <Camera className="w-10 h-10 text-slate-500" />
//           </div>
//           <p className="text-lg font-medium mb-2">Drag & drop or click to browse</p>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileSelect}
//             className="hidden"
//             id="photo-upload"
//           />
//           <label htmlFor="photo-upload" className="cursor-pointer">
//             <Button variant="secondary" className="px-6 py-2">
//               <Upload className="w-4 h-4 mr-2" />
//               Select Photo
//             </Button>
//           </label>
//         </div>

//         {selectedFile && (
//           <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-xl">
//             <img
//               src={URL.createObjectURL(selectedFile)}
//               alt="Preview"
//               className="w-20 h-20 object-cover rounded-lg"
//             />
//             <div className="flex-1 min-w-0">
//               <p className="font-medium truncate">{selectedFile.name}</p>
//               <p className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
//             </div>
//             <Button
//               variant="danger"
//               size="sm"
//               onClick={() => setSelectedFile(null)}
//             >
//               Remove
//             </Button>
//           </div>
//         )}

//         {selectedFile && (
//           <Button
//             size="lg"
//             className="w-full"
//             onClick={handleUpload}
//             disabled={uploading}
//           >
//             {uploading ? (
//               <>
//                 <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
//                 Processing with AI...
//               </>
//             ) : (
//               'Simulate AI Detection'
//             )}
//           </Button>
//         )}

//         {result && (
//           <Card className="p-6 bg-green-500/10 border-green-500/30">
//             <div className="flex items-center space-x-3 mb-4">
//               <CheckCircle className="w-6 h-6 text-green-400" />
//               <h3 className="font-bold text-lg">Success!</h3>
//             </div>
//             <div className="space-y-2 text-sm">
//               <p><strong>Lot:</strong> {result.lotId}</p>
//               <p><strong>Photo Occupancy:</strong> {result.photoOccupancy}%</p>
//               <p><strong>Total Spots:</strong> {result.totalSpots}</p>
//             </div>
//           </Card>
//         )}

//         {error && (
//           <Card className="p-6 bg-red-500/10 border-red-500/30">
//             <div className="flex items-center space-x-3">
//               <XCircle className="w-6 h-6 text-red-400" />
//               <span className="font-medium text-red-300">{error}</span>
//             </div>
//           </Card>
//         )}
//       </div>
//     </Card>
//   );
// }

'use client';
import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
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
  };

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">📸 Photo Upload</h2>
      <div className="space-y-6">
        <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center hover:border-blue-500 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`photo-upload-${lotId}`}
          />
          <label htmlFor={`photo-upload-${lotId}`}>
            <div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Camera className="w-10 h-10 text-slate-500" />
            </div>
            <p className="text-lg font-medium mb-2">Click to upload photo</p>
            {selectedFile && <p className="text-blue-400">{selectedFile.name}</p>}
          </label>
        </div>

        {selectedFile && (
          <Button size="lg" className="w-full" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Processing...' : 'Simulate AI Detection'}
          </Button>
        )}

        {result && (
          <Card className="bg-green-500/10 border-green-500/30 p-6">
            <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
            <p>Photo processed! {result.photoOccupancy}% occupancy</p>
          </Card>
        )}
      </div>
    </Card>
  );
}