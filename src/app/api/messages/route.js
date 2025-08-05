// src/app/api/messages/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { socket } from "@/lib/socket";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const chatId = searchParams.get("chatId") || "";
    const query = searchParams.get("query") || "";

    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
        content: { contains: query.toLowerCase() },
      },
      include: {
        sender: true, // ✅ Include sender details
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { chatId, content, isFile } = body;

    const newMessage = await prisma.message.create({
      data: {
        content,
        chatId,
        senderId: userId,
        isFile: isFile || false,
      },
      // ✅ This ensures the sender's name and image are included
      include: {
        sender: true,
      },
    });

    // NOTE: The socket emit for private messages should be on the client
    // to ensure consistency with the group chat fix.

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
