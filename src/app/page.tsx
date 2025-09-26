"use client";

import { useState, useEffect } from "react";
import { put } from "@vercel/blob";

interface FileItem {
  name: string;
  size: number;
  uploadDate: Date;
  blobUrl?: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  // Fetch files from the server
  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files");
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        console.error("Failed to fetch files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  // Upload file directly to Vercel Blob
  const uploadFile = async () => {
    if (!selectedFile) {
      setMessage("Please select a file");
      setMessageType("error");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // Generate unique filename
      const fileName = `${Date.now()}-${selectedFile.name}`;

      // Upload to Vercel Blob
      await put(fileName, selectedFile, {
        access: "public",
      });

      setMessage("File uploaded successfully");
      setMessageType("success");
      setSelectedFile(null);
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Upload failed");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  // Download file using blob URL
  const downloadFile = (file: FileItem) => {
    if (file.blobUrl) {
      window.open(file.blobUrl, "_blank");
    } else {
      // Fallback to API if no blob URL
      window.open(`/api/download/${file.name}`, "_blank");
    }
  };

  // Delete file
  const deleteFile = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/delete/${filename}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFiles(); // Refresh the file list
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Delete failed");
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Get file icon based on extension
  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const iconMap: Record<string, string> = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      zip: "📦",
      txt: "📃",
      json: "📋",
      csv: "📊",
    };
    return iconMap[ext] || "📄";
  };

  // Initial fetch
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Simple File Storage
          </h1>
          <p className="text-gray-600">
            Upload, download, and manage your files
          </p>
        </header>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              messageType === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📤</span> Upload File
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <span className="text-4xl mb-2">📁</span>
                <p className="text-gray-600 mb-2">Choose a file to upload</p>
                <p className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : "No file selected"}
                </p>
              </label>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={uploadFile}
                disabled={uploading || !selectedFile}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  "Upload File"
                )}
              </button>
            </div>
          </div>

          {/* File Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span> File Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {files.length}
                </p>
                <p className="text-gray-600">Total Files</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {formatFileSize(
                    files.reduce((total, file) => total + file.size, 0)
                  )}
                </p>
                <p className="text-gray-600">Total Size</p>
              </div>
            </div>
          </div>
        </div>

        {/* File List Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="mr-2">📋</span> File List
            </h2>
          </div>
          <div className="overflow-x-auto">
            {files.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📁</div>
                <p className="text-gray-600 text-lg">No files uploaded yet</p>
                <p className="text-gray-500 mt-2">
                  Upload your first file to get started
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {getFileIcon(file.name)}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {file.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.uploadDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => downloadFile(file)}
                          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                          title="Download"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteFile(file.name)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
