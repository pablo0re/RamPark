import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    // Import runs server-side only — avoids Turbopack client-bundle parse errors
    const { getDocument } = await import("pdfjs-dist");

    const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join("\n") + "\n";
    }

    return NextResponse.json({ text: fullText });
  } catch (e: any) {
    console.error("PDF parse error:", e);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
