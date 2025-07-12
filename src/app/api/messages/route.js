import { writeFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");
    const senderId = data.get("senderId");
    const senderName = data.get("senderName");

    if (!file || !senderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), "public", "uploads", fileName);

    await writeFile(path, buffer);

    // Save to database
    const message = await prisma.message.create({
      data: {
        text: `FILE:${fileName}`,
        senderId,
        isFile: true,
      },
    });

    return Response.json({
      url: `/uploads/${fileName}`,
      fileName: file.name,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}
