// src/app/api/group-messages/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
      include: {
        sender: true,
      },
    });

    // The socket emit is now handled on the client side
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating group message:", error);
    return NextResponse.json(
      { error: "Failed to create group message" },
      { status: 500 }
    );
  }
}

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
