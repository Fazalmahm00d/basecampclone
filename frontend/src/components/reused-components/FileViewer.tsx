import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink, Eye } from "lucide-react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { DialogTitle } from '@radix-ui/react-dialog';

interface File {
  _id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  createdAt: string;
}

interface FileViewerDialogProps {
  file: File;
  onClose?: () => void;
}

const FileViewerDialog: React.FC<FileViewerDialogProps> = ({ file, onClose }) => {
  const [viewerError, setViewerError] = useState(false);

  const docs = [
    {
      uri: file.path,
      fileType: file.type,
      fileName: file.name,
    }
  ];

  return (
    <Dialog open onOpenChange={() => onClose?.()}>
      <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-scroll">
        <div className="flex justify-between items-center mb-4">
          {/* <h2 className="text-xl font-semibold truncate">{file.name}</h2> */}
          <DialogTitle>{file.name}</DialogTitle>
          <div className="flex items-center gap-2">
            {/* Download button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = file.path;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
            
            {/* Open in new tab button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(file.path, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            {/* Close button */}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => onClose?.()}
            >
              <X className="w-4 h-4" />
            </Button> */}
          </div>
        </div>

        <div className="h-full min-h-[60vh]  ">
          {viewerError ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <p className="text-red-500">Unable to preview this file</p>
              <Button
                onClick={() => window.open(file.path, '_blank')}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in New Tab</span>
              </Button>
            </div>
          ) : (
            <DocViewer
              documents={docs}
              pluginRenderers={DocViewerRenderers}
              style={{ height: '100%' }}
              config={{
                header: {
                  disableHeader: true,
                  disableFileName: true,
                },
              }}
              onError={(e:any) => {
                console.error('DocViewer error:', e);
                setViewerError(true);
              }}
            />
            
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerDialog