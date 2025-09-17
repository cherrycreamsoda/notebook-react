import { NextResponse } from "next/server";
import dbConnect from "@lib/db";
import Note from "@lib/models/Note";
import mongoose from "mongoose";

export async function DELETE(req, context) {
  await dbConnect();
  const { id } = await context.params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid note ID" },
      { status: 400 }
    );
  }

  try {
    const deleted = await Note.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: { _id: id } });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
