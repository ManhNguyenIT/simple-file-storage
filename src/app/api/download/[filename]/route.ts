import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const blob = await head(filename);

    if (!blob) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Redirect to the blob URL for direct download
    return NextResponse.redirect(blob.url);
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
