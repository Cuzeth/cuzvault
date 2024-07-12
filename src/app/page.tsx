'use client';

import { useState, ChangeEvent } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  const [image, setImage] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!image) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', image);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setUrl(data.url);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <button
          className="px-4 py-2 font-semibold bg-white text-blue-500 rounded hover:bg-gray-200 transition duration-200"
          onClick={() => signIn('github')}
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 text-white">
      <h1 className="text-5xl font-bold mb-6">Upload Image</h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        className="px-4 py-2 font-semibold bg-green-500 rounded hover:bg-green-700 transition duration-200"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {uploading && (
        <div className="mt-4 text-center">
          <p className="text-lg text-gray-300">Uploading your file...</p>
        </div>
      )}
      {url && (
        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold">Uploaded Image URL:</h2>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 underline"
          >
            {url}
          </a>
        </div>
      )}
      <button
        className="mt-4 px-4 py-2 font-semibold bg-red-500 rounded hover:bg-red-700 transition duration-200"
        onClick={() => signOut()}
      >
        Sign out
      </button>
    </div>
  );
}