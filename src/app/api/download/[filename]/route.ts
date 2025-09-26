import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const filePath = join(process.cwd(), "assets", filename);

    const fileBuffer = await readFile(filePath);

    // Determine the content type based on file extension
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const contentTypeMap: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      txt: "text/plain",
      json: "application/json",
      csv: "text/csv",
      xml: "application/xml",
      zip: "application/zip",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    const contentType = contentTypeMap[ext] || "application/octet-stream";

    const blob = new Blob([new Uint8Array(fileBuffer)], { type: contentType });
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
