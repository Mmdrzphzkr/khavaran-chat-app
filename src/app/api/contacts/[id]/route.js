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

    console.log("🔧 PUT /contacts/[id]", {
      contactId,
      userId,
      body,
    });

    const existingContact = await prisma.contact.findUnique({
      where: {
        id: contactId,
        addedById: userId, // ✅ Ensure only contacts added by the user are editable
      },
    });

    if (!existingContact) {
      console.warn("⚠️ Contact not found or unauthorized:", contactId);
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const updatedContact = await prisma.contact.update({
      where: {
        id: contactId,
        addedById: userId,
      },
      data: {
        firstName,
        lastName,
        phone,
        email,
      },
    });

    console.log("✅ Contact updated:", updatedContact.id);
    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error("❌ PUT /contacts/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}
