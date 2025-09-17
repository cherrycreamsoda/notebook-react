import { NextResponse } from "next/server";
import dbConnect from "@lib/db";
import Note from "@lib/models/Note";
import mongoose from "mongoose";

const isValidId = (id) => mongoose.isValidObjectId(id);

export async function GET(req, context) {
  await dbConnect();
  const { id } = await context.params;

  if (!isValidId(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid note ID" },
      { status: 400 }
    );
  }

  try {
    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: note });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  await dbConnect();
  const { id } = await context.params;

  if (!isValidId(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid note ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    const allowed = ["title", "content", "rawContent", "type", "pinned"];
    const $set = {};
    for (const k of allowed) {
      if (k in body) $set[k] = body[k];
    }

    const note = await Note.findByIdAndUpdate(id, { $set }, { new: true });
    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: note });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  await dbConnect();
  const { id } = await context.params;

  if (!isValidId(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid note ID" },
      { status: 400 }
    );
  }

  try {
    const note = await Note.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );
    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: note });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
