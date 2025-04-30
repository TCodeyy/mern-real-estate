import React from 'react';

export default function ImagePreviewList({ imageUrls, onRemove }) {
  return (
    <div className="flex flex-col flex-wrap gap-4 mt-2">
      {imageUrls.map((url, index) => (
        <div
          key={index}
          className="flex justify-between p-3 border items-center"
        >
          <img
            src={url}
            alt={`preview-${index}`}
            className="w-20 h-20 object-contain rounded-lg"
          />
          <button
            className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
            type="button"
            onClick={() => onRemove(index)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
