import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const assetsDir = join(process.cwd(), "public/assets");
    const files = await readdir(assetsDir);

    const fileList = await Promise.all(
      files.map(async (file) => {
        const filePath = join(assetsDir, file);
        const fileStats = await stat(filePath);
        return {
          name: file,
          size: fileStats.size,
          uploadDate: fileStats.birthtime,
        };
      })
    );

    return NextResponse.json(fileList);
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}
