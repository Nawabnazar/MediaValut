import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeMedia } from "@/lib/media";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const sort = searchParams.get("sort") ?? "recent";
    const query = searchParams.get("q")?.toLowerCase() ?? "";

    const where: Record<string, unknown> = {};
    if (type === "image" || type === "video") {
      where.mediaType = type;
    }

    const items = await prisma.media.findMany({
      where,
      orderBy: {
        uploadDate: sort === "oldest" ? "asc" : "desc",
      },
    });

    let serialized = items.map(serializeMedia);

    if (query) {
      serialized = serialized.filter((item) =>
        item.fileName.toLowerCase().includes(query)
      );
    }

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("GET /api/media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
