import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET() {
  try {
    const { blobs } = await list();

    const fileList = blobs.map((blob) => ({
      name: blob.pathname,
      size: blob.size,
      uploadDate: new Date(blob.uploadedAt),
      blobUrl: blob.url,
    }));

    return NextResponse.json(fileList);
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}
