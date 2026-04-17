import React, { useState } from "react";
import axios from "axios";
import { Upload, CheckCircle, AlertCircle, FileUp, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const AdminImport = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === "text/csv" || selectedFile?.name.endsWith(".csv")) {
      setFile(selectedFile);
      setResult(null);
      setError("");
    } else {
      setError("Please select a valid CSV file");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile?.type === "text/csv" || droppedFile?.name.endsWith(".csv")) {
      setFile(droppedFile);
      setResult(null);
      setError("");
    } else {
      setError("Please drop a valid CSV file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first");
      return;
    }
    setLoading(true);
    setResult(null);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/api/admin/import-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      toast.success("Alumni imported successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Upload failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <FileUp className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin: Import Alumni</h1>
          <p className="text-lg text-gray-600">Upload a CSV file to add alumni to the portal</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Drag and Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 hover:border-indigo-400"
              }`}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? "text-indigo-600" : "text-gray-400"}`} />
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Drag and drop your CSV file
              </p>
              <p className="text-gray-600 mb-4">or</p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
                  Select File
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-4">CSV format required (name, email, department, batch)</p>
            </div>

            {/* Selected File Display */}
            {file && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">{file.name}</p>
                  <p className="text-sm text-green-700">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              type="submit"
              className="w-full mt-8 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload and Import
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="px-8 pb-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {result && (
            <div className="border-t border-gray-200 p-8 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Import Summary</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 text-sm font-medium mb-1">Created</p>
                  <p className="text-3xl font-bold text-green-600">{result.created?.length || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 text-sm font-medium mb-1">Skipped</p>
                  <p className="text-3xl font-bold text-yellow-600">{result.skipped?.length || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 text-sm font-medium mb-1">Failed</p>
                  <p className="text-3xl font-bold text-red-600">{result.failed?.length || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminImport;
