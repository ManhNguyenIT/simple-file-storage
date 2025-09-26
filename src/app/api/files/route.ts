import { NextResponse } from "next/server";
import { readdir, stat, mkdir } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const assetsDir = join(process.cwd(), "assets");
    await mkdir(assetsDir, { recursive: true });
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
