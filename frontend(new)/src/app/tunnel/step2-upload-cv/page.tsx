'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, FileCheck, Loader2, ChevronRight, FileX, AlertCircle } from 'lucide-react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadCvStep() {
  const router = useRouter();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [parsedResume, setParsedResume] = useState<any>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    // Check if World ID is verified
    const worldIdVerified = localStorage.getItem('worldId_verified');
    const nullifierHash = localStorage.getItem('worldId_nullifier');

    if (!worldIdVerified || !nullifierHash) {
      setError('Please verify your identity with World ID first');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setFileName('Unsupported file type');
      setError('Please upload a PDF or DOCX file');
      setStatus('error');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setFileName('File too large');
      setError('File size must be less than 5MB');
      setStatus('error');
      return;
    }

    setFileName(file.name);
    setStatus('uploading');
    setError('');
    setParsedResume(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('user_id', nullifierHash);

      const response = await fetch('/api/candidate/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Resume upload failed');
      }

      setStatus('success');
      setParsedResume(data.data);

      // Store parsed resume data in localStorage for next steps
      localStorage.setItem('parsedResume', JSON.stringify(data.data));
      localStorage.setItem('resumeFile', file.name);

      console.log('Resume uploaded and parsed successfully:', data.data);
    } catch (err: any) {
      console.error('Resume upload error:', err);
      setError(err.message || 'Resume upload failed');
      setStatus('error');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleContinue = () => {
    if (status === 'error') {
      setStatus('idle');
      setFileName('');
      setError('');
      setParsedResume(null);
    } else if (status === 'success') {
      router.push('/tunnel/step3-parse-cv');
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setFileName('');
    setError('');
    setParsedResume(null);
  };

  return (
    <div className="p-4">
      <Card className="w-full max-w-md mx-auto border-none shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Upload Your CV</CardTitle>
          <CardDescription>
            Let's start by uploading your resume. We accept PDF or DOCX files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label
              htmlFor="cv-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                } ${status === 'uploading' ? 'pointer-events-none' : ''}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                {status === 'idle' && <UploadCloud className="w-10 h-10 mb-3 text-primary" />}
                {status === 'uploading' && <Loader2 className="w-10 h-10 mb-3 text-primary animate-spin" />}
                {status === 'success' && <FileCheck className="w-10 h-10 mb-3 text-green-500" />}
                {status === 'error' && <FileX className="w-10 h-10 mb-3 text-red-500" />}

                <p className="mb-1 text-sm text-muted-foreground">
                  {status === 'idle' && <><span className="font-semibold text-primary">Click to upload</span> or drag and drop</>}
                  {status === 'uploading' && 'Uploading and parsing...'}
                  {status === 'success' && 'Upload Complete!'}
                  {status === 'error' && 'Upload Failed. Try again.'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {status === 'idle' && 'PDF or DOCX (MAX. 5MB)'}
                  {fileName && (status === 'uploading' || status === 'success' || status === 'error') && fileName}
                </p>
              </div>
              <input
                id="cv-upload"
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleInputChange}
                disabled={status === 'uploading'}
              />
            </label>
          </motion.div>

          {/* Error display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Success info */}
          {status === 'success' && parsedResume && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-800">Resume parsed successfully!</p>
              </div>
              <div className="text-xs text-green-700 space-y-1">
                {parsedResume.workExperience && parsedResume.workExperience.length > 0 && (
                  <p>• Found {parsedResume.workExperience.length} work experience(s)</p>
                )}
                {parsedResume.education && parsedResume.education.length > 0 && (
                  <p>• Found {parsedResume.education.length} education entry(s)</p>
                )}
                {parsedResume.skills && parsedResume.skills.length > 0 && (
                  <p>• Found {parsedResume.skills.length} skill(s)</p>
                )}
                {parsedResume.name && (
                  <p>• Name: {parsedResume.name}</p>
                )}
                {parsedResume.email && (
                  <p>• Email: {parsedResume.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              className="w-full rounded-full h-12 text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent/50"
              disabled={status === 'uploading' || status === 'idle'}
            >
              {status === 'error' ? 'Try Again' : 'Continue'}
              {status === 'success' && <ChevronRight className="w-5 h-5 ml-2" />}
            </Button>

            {status === 'error' && (
              <Button
                onClick={handleRetry}
                variant="outline"
                className="w-full rounded-full h-12 text-base font-semibold"
              >
                Choose Different File
              </Button>
            )}
          </div>

          {/* Upload progress indicators */}
          {status === 'uploading' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing...</span>
                <span className="text-muted-foreground">Please wait</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
