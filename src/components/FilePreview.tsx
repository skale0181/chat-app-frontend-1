import React from 'react';
import { FileText, Image, Video, Download } from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';

type FilePreviewProps = {
  contentType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
};

const FilePreview: React.FC<FilePreviewProps> = ({ 
  contentType, 
  fileUrl, 
  fileName, 
  fileSize 
}) => {
  const handleDownload = () => {
    window.open(fileUrl, '_blank');
  };
  
  return (
    <div className="max-w-[300px] max-h-[300px]">
      {contentType === 'image' ? (
        <div className="mb-2">
          <img 
            src={fileUrl} 
            alt={fileName} 
            className="rounded max-w-full object-cover cursor-pointer max-h-[250px]" 
            onClick={handleDownload}
          />
        </div>
      ) : contentType === 'video' ? (
        <div className="mb-2">
          <video 
            src={fileUrl} 
            controls 
            className="rounded max-w-[250px] max-h-[250px]"
          />
        </div>
      ) : null}
      
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-2 rounded">
        <div className="mr-3">
          {contentType === 'image' ? (
            <Image size={24} className="text-green-600" />
          ) : contentType === 'video' ? (
            <Video size={24} className="text-blue-600" />
          ) : (
            <FileText size={24} className="text-orange-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate font-medium">{fileName}</p>
          <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
        </div>
        
        <button 
          onClick={handleDownload}
          className="ml-2 text-gray-600 hover:text-gray-900"
          title="Download"
        >
          <Download size={18} />
        </button>
      </div>
    </div>
  );
};

export default FilePreview;