import React, { useState } from 'react';

const ImageUpload = ({ onImageSelect, onChange, multiple = false, preview = true, maxSize = 5 }) => {
    const [previews, setPreviews] = useState([]);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setError('');

        // Validate file size
        const maxSizeBytes = maxSize * 1024 * 1024;
        const invalidFiles = files.filter(file => file.size > maxSizeBytes);

        if (invalidFiles.length > 0) {
            setError(`File size must be less than ${maxSize}MB`);
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const invalidTypes = files.filter(file => !validTypes.includes(file.type));

        if (invalidTypes.length > 0) {
            setError('Only image files (JPEG, PNG, GIF, WEBP) are allowed');
            return;
        }

        // Create previews
        if (preview) {
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);
        }

        // Call parent callback - support both prop names
        const callback = onChange || onImageSelect;
        if (callback) {
            callback(multiple ? files : files[0]);
        }
    };

    const removePreview = (index) => {
        const newPreviews = previews.filter((_, i) => i !== index);
        setPreviews(newPreviews);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP (MAX. {maxSize}MB)</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple={multiple}
                        onChange={handleFileChange}
                    />
                </label>
            </div>

            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}

            {preview && previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.map((src, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={src}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => removePreview(index)}
                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
