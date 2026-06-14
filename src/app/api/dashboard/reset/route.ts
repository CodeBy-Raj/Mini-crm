import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Rely on cascade deletes or run them in reverse order
    await prisma.aIRecommendation.deleteMany({});
    await prisma.communication.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.campaign.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "Database truncated safely. All CRM data has been reset.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reset database." },
      { status: 500 }
    );
  }
}
