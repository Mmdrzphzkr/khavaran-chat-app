"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
      setPreview(session.user.image ? `${session.user.image}?t=${Date.now()}` : "");
    }
  }, [session]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setImage(data.url);
    setPreview(`${data.url}?t=${Date.now()}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, image }),
    });

    const result = await res.json();
    setMessage(result?.error ? "Failed to update profile" : "Profile updated!");
    setLoading(false);

    // 🔄 Refresh session
    await updateSession();
  };

  const getAvatarUrl = (url) => {
    return url && url.trim() !== "" ? url : "/no-profile.png";
  };

  if (!session) {
    return (
      <p className="p-4 text-center">Please sign in to view your profile.</p>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow">
      <Link
        href="/chat"
        className="my-3 text-center inline-block p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        return
      </Link>
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Edit Profile
      </h1>

      {message && (
        <p className="mb-4 text-sm text-green-600 dark:text-green-400">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300">
            Profile Image
          </label>
          <img
            src={getAvatarUrl(preview)}
            alt="Profile"
            className="w-24 h-24 rounded-full my-2 object-cover border"
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
