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

    const currentUserId = session.user.id;
    const { contactId } = await req.json(); // Contact ID of the selected contact

    console.log("Current User ID:", currentUserId);
    console.log("Contact ID:", contactId);

    // Retrieve the contact from the Contact table
    const contact = await prisma.contact.findUnique({
      where: {
        id: contactId,
      },
    });

    if (!contact) {
      console.error("Contact not found!");
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const otherUserId = contact.userId; // Get the actual user ID from the contact

    console.log("Other User ID:", otherUserId);

    // Verify the other user
    const otherUser = await prisma.user.findUnique({
      where: {
        id: otherUserId,
      },
    });

    if (!otherUser) {
      console.error("Other user not found!");
      return NextResponse.json(
        { error: "Other user not found" },
        { status: 404 }
      );
    }

    // Check if a chat already exists between the two users
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          {
            users: {
              some: { id: currentUserId },
            },
          },
          {
            users: {
              some: { id: otherUserId },
            },
          },
        ],
      },
      include: {
        users: true, // Include users to check the count
      },
    });

    console.log("Existing Chat:", existingChat);

    // Ensure the chat has exactly two users
    if (existingChat && existingChat.users.length === 2) {
      // Chat exists with exactly the two users, return the chatId
      return NextResponse.json({ chatId: existingChat.id });
    } else {
      // Chat doesn't exist or has incorrect number of users, create a new one
      const newChat = await prisma.chat.create({
        data: {
          isGroup: false, // 1-on-1 chat
          users: {
            connect: [{ id: currentUserId }, { id: otherUserId }],
          },
        },
      });

      console.log("New Chat:", newChat);
      return NextResponse.json({ chatId: newChat.id }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating/fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to create/fetch chat" },
      { status: 500 }
    );
  }
}
