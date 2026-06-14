import { NextRequest, NextResponse } from "next/server";
import { SegmentationService } from "@/services/segmentation.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        { error: "A valid prompt string is required." },
        { status: 400 }
      );
    }

    // Call service to fetch AI-translated structured filter and query database
    const result = await SegmentationService.buildAudience(prompt.trim());

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("API Segmentation Route Error:", err);
    return NextResponse.json(
      { error: err.message || "An error occurred during audience segment generation." },
      { status: 500 }
    );
  }
}
