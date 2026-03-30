"use client";

import { useState, useEffect } from "react";
import { Trash2, UploadCloud, Loader2 } from "lucide-react";

export default function AdminGalleryPage() {
    const [images, setImages] = useState<any[]>([]);
    const [houses, setHouses] = useState<any[]>([]);
    const [selectedHouseId, setSelectedHouseId] = useState<string>("general");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchGallery();
        fetchHouses();
    }, []);

    async function fetchHouses() {
        try {
            const res = await fetch("/api/houses");
            const data = await res.json();
            setHouses(data);
        } catch {
            console.error("Failed to fetch houses");
        }
    }

    async function fetchGallery() {
        try {
            const res = await fetch("/api/gallery");
            const data = await res.json();
            setImages(data);
        } catch {
            //
        } finally {
            setLoading(false);
        }
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            // Upload to Cloudinary
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                throw new Error("Failed to upload image.");
            }

            const uploadData = await uploadRes.json();

            // Save to database
            await fetch("/api/gallery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: uploadData.url,
                    houseId: selectedHouseId === "general" ? null : selectedHouseId
                }),
            });

            await fetchGallery();
        } catch (error) {
            alert("Error uploading image. Ensure your Cloudinary credentials are set properly in .env.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this image?")) return;

        await fetch(`/api/gallery/${id}`, {
            method: "DELETE",
        });
        setImages(images.filter((img) => img.id !== id));
    }

    if (loading) {
        return (
            <div>
                <h1 className="font-display text-3xl text-white mb-8">Gallery Management</h1>
                <div className="glass p-10 text-center text-gray-500">Loading gallery...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-display text-3xl text-white">Gallery Management</h1>
                    <p className="text-[#b1b1ba] text-sm mt-1">Manage photos shown on the public gallery section.</p>
                </div>
            </div>

            <div className="mb-8 p-8 glass border-dashed border-2 border-[rgba(255,255,255,0.1)] flex flex-col items-center justify-center text-center rounded-2xl">
                <UploadCloud size={40} className="text-[#b1b1ba] mb-4" />
                <h3 className="text-white font-medium mb-1">Upload New Image</h3>
                <p className="text-sm text-[#b1b1ba] mb-4">Select an image to add it immediately to your public gallery.</p>

                <div className="mb-6 w-full max-w-xs text-left">
                    <label className="block text-xs font-bold text-[#b1b1ba] mb-2">Assign Location (Optional)</label>
                    <select
                        value={selectedHouseId}
                        onChange={(e) => setSelectedHouseId(e.target.value)}
                        className="w-full bg-[#121216] border border-[rgba(255,255,255,0.08)] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[#ff7a1a]"
                    >
                        <option value="general">General Gallery</option>
                        {houses.map(h => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                    </select>
                </div>

                <label className={`cursor-pointer inline-block px-8 py-3 rounded-full font-bold text-sm ${uploading ? 'bg-white/10 text-gray-400' : 'bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] hover:-translate-y-0.5 transition-transform shadow-[0_12px_30px_rgba(255,122,26,0.25)]'}`}>
                    {uploading ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Uploading...</span> : "Select & Upload Image"}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                </label>
            </div>

            {images.length === 0 ? (
                <div className="glass p-10 text-center text-gray-500 rounded-2xl">No images in gallery yet. Upload above!</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map(img => (
                        <div key={img.id} className="relative group rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)] aspect-[4/3] bg-[rgba(255,255,255,0.02)] shadow-xl">
                            <img src={img.url} alt="Gallery item" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                            {img.house && <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[0.65rem] font-bold text-white border border-white/10">{img.house.name}</span>}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                <button
                                    onClick={() => handleDelete(img.id)}
                                    className="w-10 h-10 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
                                    title="Delete Image"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
