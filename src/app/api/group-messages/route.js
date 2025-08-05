// src/app/api/group-messages/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { socket } from "@/lib/socket";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, content, isFile } = await req.json();
    const newMessage = await prisma.groupMessage.create({
      data: {
        groupId,
        content,
        isFile,
        senderId: session.user.id,
      },
      // ✅ This is the critical addition
      include: {
        sender: true,
      },
    });

    // The server-side socket was missing. Let's re-add it.
    // NOTE: This assumes you have a running socket server that this API can access.
    // If your socket server is separate, this emit should happen there.
    // For now, let's assume direct access for simplicity.
    io.to(groupId).emit("receive-group-message", newMessage);

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating group message:", error);
    return NextResponse.json(
      { error: "Failed to create group message" },
      { status: 500 }
    );
  }
}

// ... GET function remains the same
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const query = searchParams.get("query") || "";

    const messages = await prisma.groupMessage.findMany({
      where: {
        groupId,
        content: {
          contains: query,
        },
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch group messages" },
      { status: 500 }
    );
  }
}
