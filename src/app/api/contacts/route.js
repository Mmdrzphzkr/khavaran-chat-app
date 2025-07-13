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

    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query") || "";

    const contacts = await prisma.contact.findMany({
      where: {
        userId: userId,
        OR: [
          { firstName: { contains: query.toLowerCase() } },
          { lastName: { contains: query.toLowerCase() } },
          { email: { contains: query.toLowerCase() } },
        ],
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

    const userId = session.user.id;
    const body = await req.json();
    const { firstName, lastName, phone, email } = body;

    const newContact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        userId,
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
