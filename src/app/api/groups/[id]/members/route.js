// src/app/api/groups/[id]/members/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();
    const groupId = params.id;
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (group.adminId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // ✅ Check if the user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this group" },
        { status: 409 } // 409 Conflict is a good status code for this
      );
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId: groupId,
        userId,
      },
      include: {
        user: true, // ✅ Include user data in the response
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}

// ... DELETE function remains the same
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId } = await req.json();

    const group = await prisma.group.findUnique({
      where: { id: params.id },
    });

    if (group.adminId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.groupMember.deleteMany({
      where: {
        groupId: params.id,
        userId: userId,
      },
    });
    return NextResponse.json({ message: "Member removed" });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
