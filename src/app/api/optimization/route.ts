import { NextRequest, NextResponse } from "next/server";
import { OptimizationService } from "@/services/optimization.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required as a query parameter." },
        { status: 400 }
      );
    }

    const recommendations = await OptimizationService.getRecommendations(campaignId);
    
    // Also try to get or generate the latest single recommendation as active highlight
    const latest = await OptimizationService.getOrGenerateLatest(campaignId);

    return NextResponse.json({
      success: true,
      recommendations,
      latest,
    });
  } catch (err: any) {
    console.error("API GET Optimization error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve optimization recommendations." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required in the body payload." },
        { status: 400 }
      );
    }

    const recommendation = await OptimizationService.generateAndStore(campaignId);

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (err: any) {
    console.error("API POST Optimization error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate optimization recommendation." },
      { status: 500 }
    );
  }
}
