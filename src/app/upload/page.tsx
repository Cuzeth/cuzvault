"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import axios from "axios";

export default function UploadPage() {
    const { data: session, status } = useSession();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    if (status === "loading") {
        return <p className="text-center text-lg">Loading...</p>;
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <p className="mb-4 text-2xl font-bold">Not signed in</p>
                <button
                    className="px-4 py-2 font-semibold bg-white text-blue-500 rounded hover:bg-gray-200 transition duration-200"
                    onClick={() => signIn("github")}
                >
                    Sign in with GitHub
                </button>
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setImageUrl(response.data.imageUrl);
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-5xl font-bold mb-8 text-center text-gray-800">Upload Image</h1>
            <div className="mb-4">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                onClick={handleUpload}
                disabled={uploading}
            >
                {uploading ? "Uploading..." : "Upload"}
            </button>
            {uploading && (
                <div className="mt-4 text-center">
                    <p className="text-lg text-gray-600">Uploading your file...</p>
                </div>
            )}
            {imageUrl && (
                <div className="mt-4 text-center">
                    <p className="text-lg">Image uploaded successfully!</p>
                    <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                    >
                        View Image
                    </a>
                </div>
            )}
            <button
                className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-200"
                onClick={() => signOut()}
            >
                Sign out
            </button>
        </div>
    );
}