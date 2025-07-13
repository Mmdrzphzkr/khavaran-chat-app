import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const contactId = params.id;
    const body = await req.json();
    const { firstName, lastName, phone, email } = body;

    const existingContact = await prisma.contact.findUnique({
      where: {
        id: contactId,
        userId: userId,
      },
    });

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const updatedContact = await prisma.contact.update({
      where: {
        id: contactId,
        userId: userId,
      },
      data: {
        firstName,
        lastName,
        phone,
        email,
      },
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const contactId = params.id;

    const existingContact = await prisma.contact.findUnique({
      where: {
        id: contactId,
        userId: userId,
      },
    });

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    await prisma.contact.delete({
      where: {
        id: contactId,
        userId: userId,
      },
    });

    return NextResponse.json({ message: "Contact deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
