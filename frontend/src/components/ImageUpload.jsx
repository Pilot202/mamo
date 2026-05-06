import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ImageUpload = ({ onPredictionComplete }) => {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        setFiles(prev => [...prev, ...droppedFiles]);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            // Assuming backend is processed via proxy or direct URL
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/predict`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onPredictionComplete(response.data.results);
            setFiles([]); // Clear queue on success
        } catch (err) {
            console.error(err);
            setError("Failed to process images. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragging
                        ? 'border-[var(--color-primary)] bg-sky-50'
                        : 'border-slate-300 hover:border-[var(--color-primary)] hover:bg-slate-50'
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*"
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white rounded-full shadow-sm">
                        <Upload size={32} className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700">Click or Drag & Drop to Upload</h3>
                        <p className="text-sm text-slate-500 mt-1">Supports PNG, JPG (Single or Batch)</p>
                    </div>
                </div>
            </div>

            {files.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Selected Files ({files.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileImage size={18} className="text-slate-400 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 truncate">{file.name}</span>
                                    <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                    className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={uploadFiles}
                            disabled={isUploading}
                            className={`px-6 py-2 bg-[var(--color-primary)] text-white font-medium rounded-lg shadow-md shadow-sky-200 transition-all ${isUploading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[var(--color-primary-dark)] hover:shadow-lg'
                                }`}
                        >
                            {isUploading ? 'Processing...' : 'Analyze Images'}
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
