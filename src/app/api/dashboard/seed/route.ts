import { NextResponse } from "next/server";
import { SeedService } from "@/services/seed.service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    console.log("[API Seed] Seeding request received");
    const result = await SeedService.seedDatabase();
    
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully. 1,000 Customers and 3,000 Orders have been loaded.",
      details: result,
    });
  } catch (error: any) {
    console.error("[API Seed] Critical failure while seeding:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed database. Schema might be outdated or DB offline." },
      { status: 500 }
    );
  }
}
