"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderPlus, Upload, FileText, ArrowLeft, Trash2, Eye } from "lucide-react";

import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import FileViewerDialog from '@/components/reused-components/FileViewer';

interface File {
  _id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  createdAt: string;
  uploadedBy?: {
    username: string;
  };
}

interface Folder {
  _id: string;
  name: string;
  createdAt: string;
  parent?: string;
}

interface FileExplorerProps {
  projectId: string;
}

const FileExplorer: React.FC<FileExplorerProps> = () => {
  const user = useSelector((state: RootState) => state.user);
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [folderName, setFolderName] = useState<string>('');
    const [fileContent, setFileContent] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [viewFile,setViewFile]=useState<File | null>(null);
    const router=useRouter();
    const [open,setOpen]=useState(false)

  const params=useParams()
  const projectId=params.projectId
  // File upload state with progress
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  useEffect(() => {
    fetchContents();
  }, [currentFolder, projectId]);

  const handleCreateDocument = async (): Promise<void> => {
    try {
      const userresponse= await axios.get(`http://localhost:5000/api/users/user-id?email=${user.email}`)
      const userId=userresponse.data.userId
      await axios.post(`http://localhost:5000/api/files/${projectId}/${userId}/documents`, {
        name: fileName,
        content: fileContent,
        folderId: currentFolder
      });
      fetchContents();
      setFileName('');
      setFileContent('');
      setOpen(false)
      toast({
        title:"Document has been created"
      })
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]); // Ensure it's a File object
    }
  };

  const handleCreateFolder = async () => {
    try {
      await axios.post(`http://localhost:5000/api/files/${projectId}/folders`, {
        name: folderName,
        parentId: currentFolder
      });
      fetchContents();
      setFolderName('');
      setOpen(false)
      toast({
        title: "Success",
        description: "Folder has been created"
      });
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const fetchContents = async () => {
    try {
      setIsLoading(true);
      const [filesResponse, foldersResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/files/${projectId}/files?folderId=${currentFolder || ''}`),
        axios.get(`http://localhost:5000/api/files/${projectId}/folders`)
      ]);
      
      setFiles(filesResponse.data);
      setFolders(foldersResponse.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
  
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    if (currentFolder) {
      formData.append('folderId', currentFolder); // Only append if it's a valid ID
    }
  
    try {
      const userresponse = await axios.get(`http://localhost:5000/api/users/user-id?email=${user.email}`);
      const userId = userresponse.data.userId;
  
      console.log(formData, "form data");
  
      await axios.post(`http://localhost:5000/api/files/${projectId}/${userId}/upload`, formData);
      fetchContents();
      setSelectedFile(null);
      setOpen(false)
      toast({
        title: "Success",
        description: "File has been uploaded"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setOpen(false)
      toast({
        title: "Error",
        description: "Error uploading file",
        variant:"destructive"
      });
    }
  };

  const navigateToFolder = (folderId: string, folder: Folder) => {
    setFolderHistory( [ folder]);
    setCurrentFolder(folderId);
    setSelectedItems(new Set());
  };

  const navigateBack = () => {
    const newHistory = [...folderHistory];
    newHistory.pop();
    setFolderHistory(newHistory);
    setCurrentFolder(newHistory[newHistory.length - 1]?._id || null);
    setSelectedItems(new Set());
  };

  const handleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const deleteSelectedItems = async () => {
    try {
      await Promise.all(
        Array.from(selectedItems).map(id => 
          axios.delete(`/api/files/${projectId}/items/${id}`)
        )
      );
      
      toast({
        title: "Success",
        description: "Items deleted successfully"
      });
      
      setSelectedItems(new Set());
      fetchContents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete items",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-stone-200 h-screen">
          <div className="mb-6">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="mb-6"
                    >
                        ← Back to Project Dashboard
                    </Button>
                </div>
      {/* Breadcrumb Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Files & Documents</h2>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="document">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="document">
                  <FileText className="w-4 h-4 mr-2" />
                  Document
                </TabsTrigger>
                <TabsTrigger value="folder">
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Folder
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="document">
                <div className="space-y-4">
                  <div>
                    <Label>Document Name</Label>
                    <Input 
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="Enter document name"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <textarea 
                      className="w-full min-h-[200px] p-2 border rounded"
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      placeholder="Enter document content"
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateDocument}>Create Document</Button>
                  </DialogFooter>
                </div>
              </TabsContent>

              <TabsContent value="folder">
                <div className="space-y-4">
                  <div>
                    <Label>Folder Name</Label>
                    <Input 
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder="Enter folder name"
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateFolder}>Create Folder</Button>
                  </DialogFooter>
                </div>
              </TabsContent>

              <TabsContent value="upload">
                <div className="space-y-4">
                  <div>
                    <Label>Choose File</Label>
                    <Input type="file" onChange={handleFileChange} />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleFileUpload}>Upload File</Button>
                  </DialogFooter>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => setCurrentFolder(null)}>
            Root
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbEllipsis/>
        {folderHistory.map((folder, index) => (
          <BreadcrumbItem key={folder._id}>
            <BreadcrumbLink 
              onClick={() => {
                const newHistory = folderHistory.slice(0, index + 1);
                setFolderHistory(newHistory);
                setCurrentFolder(folder._id);
              }}
            >
              {folder.name}
            </BreadcrumbLink>
            <BreadcrumbEllipsis/>
          </BreadcrumbItem>
        ))}
      </Breadcrumb>

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          
          {currentFolder && (
            <Button variant="outline" onClick={navigateBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {selectedItems.size > 0 && (
            <Button variant="destructive" onClick={deleteSelectedItems}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedItems.size})
            </Button>
          )}
        </div>
        
        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <div className="w-48">
            <div className="bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-3 gap-4">
        {folders.map(folder => (
          <div
            key={folder._id}
            onClick={() => navigateToFolder(folder._id, folder)}
            className={`p-4 border rounded cursor-pointer transition-colors
              ${selectedItems.has(folder._id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
            `}
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedItems.has(folder._id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleItemSelection(folder._id);
                }}
              />
              <FolderPlus className="w-6 h-6" />
              <span className="truncate">{folder.name}</span>
            </div>
          </div>
        ))}
        
        {files.length>0 ?files.map(file => (
          <div
            key={file._id}
            className={`p-4 border rounded
              ${selectedItems.has(file._id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
            `}
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedItems.has(file._id)}
                onChange={() => handleItemSelection(file._id)}
              />
              <FileText className="w-6 h-6" />
              <div className="flex-1 min-w-0">
                <p className="truncate">{file.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {file.uploadedBy?.username || 'Unknown'}
                </p>
              </div>
              <Button
        variant="ghost"
        size="sm"
        className='text-blue-700'
        onClick={() => 
          {setViewFile(file)
          setIsOpen(true)}}
      >
        Open file
      </Button>

            {isOpen && (
              <FileViewerDialog
                file={viewFile!}
                onClose={() => setIsOpen(false)}
              />
            )}
            </div>
          </div>
        ))
        :<div>
          No files inside this  folder
        </div>
      }
      </div>
    </div>
  );
};

export default FileExplorer;