import { NextResponse } from "next/server";
import dbConnect from "@lib/db";
import Note from "@lib/models/Note";

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const includeAll = searchParams.get("includeAll") === "true";

    let filter = {};

    if (search) {
      const includeDeleted = view === "deleted";
      filter = {
        $and: [
          includeDeleted ? {} : { deleted: false },
          {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { rawContent: { $regex: search, $options: "i" } },
            ],
          },
        ],
      };
      if (type) {
        filter.$and.push({ type });
      }
    } else if (includeAll || view === "all") {
      filter = {};
      if (type) {
        filter.type = type;
      }
    } else if (view === "deleted") {
      filter = { deleted: true };
      if (type) filter.type = type;
    } else if (view === "pinned") {
      filter = { deleted: false, pinned: true };
      if (type) filter.type = type;
    } else {
      filter = { deleted: false };
      if (type) filter.type = type;
    }

    const notes = await Note.find(filter).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, data: notes });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const note = await Note.create({
      title: body.title ?? "Untitled",
      content: body.content ?? "",
      rawContent: body.rawContent ?? "",
      type: body.type ?? "TEXT",
      pinned: !!body.pinned,
      deleted: false,
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
