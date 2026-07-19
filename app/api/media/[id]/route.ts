import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeMedia } from "@/lib/media";
import { deleteMediaFile } from "@/lib/storage";

type RouteContext = { params: Promise<{ id: string }> };

function bucketForPath(
  filePath: string,
  mediaType: string
): "images" | "videos" | "thumbnails" {
  if (filePath.includes("/thumbnails/") || filePath.includes("thumbnails"))
    return "thumbnails";
  return mediaType === "video" ? "videos" : "images";
}

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

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const item = await prisma.media.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteMediaFile(
      item.filePath,
      bucketForPath(item.filePath, item.mediaType)
    );
    if (item.thumbnailPath) {
      await deleteMediaFile(item.thumbnailPath, "thumbnails");
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
