import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeMedia } from "@/lib/media";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const item = await prisma.media.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(serializeMedia(item));
  } catch (error) {
    console.error("GET /api/media/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const fileName = body.fileName as string | undefined;

    if (!fileName?.trim()) {
      return NextResponse.json(
        { error: "fileName is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.media.update({
      where: { id },
      data: { fileName: fileName.trim() },
    });

    return NextResponse.json(serializeMedia(updated));
  } catch (error) {
    console.error("PATCH /api/media/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

async function deleteFile(relativePath: string) {
  const fullPath = path.join(process.cwd(), "public", relativePath);
  await fs.unlink(fullPath).catch(() => undefined);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const item = await prisma.media.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteFile(item.filePath.replace(/^\//, ""));
    if (item.thumbnailPath) {
      await deleteFile(item.thumbnailPath.replace(/^\//, ""));
    }

    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/media/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
