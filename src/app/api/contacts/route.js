// // src/app/api/contacts/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query") || "";

    const contacts = await prisma.contact.findMany({
      where: {
        addedById: currentUserId, // Filter by the user who added the contact
        OR: [
          { firstName: { contains: query.toLowerCase() } },
          { lastName: { contains: query.toLowerCase() } },
          { email: { contains: query.toLowerCase() } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            image: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
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

    const currentUserId = session.user.id;
    const body = await req.json();
    const { firstName, lastName, phone, email } = body;

    // First, check if a user with the provided email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 }
      );
    }

    // If user exists, connect to their account and add current user as addedBy
    const newContact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        userId: existingUser.id,
        addedById: currentUserId, // Save the ID of the user who is adding the contact
      },
    });

    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
