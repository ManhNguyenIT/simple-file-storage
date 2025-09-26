import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;

    // Delete the blob
    await del(filename);

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
