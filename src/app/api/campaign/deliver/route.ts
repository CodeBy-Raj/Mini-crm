import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/campaign/deliver
 * Processes all PENDING communications for launched campaigns
 * and simulates delivery by updating their status to DELIVERED or FAILED.
 * This is the fallback for when the external channel-service is not running.
 */
export async function POST(req: NextRequest) {
  try {
    // Find all communications that are still in PENDING state
    // for campaigns that are not DRAFT
    const pendingComms = await prisma.communication.findMany({
      where: {
        status: "PENDING",
        campaign: {
          status: { not: "DRAFT" },
        },
      },
      select: { id: true },
    });

    if (pendingComms.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending communications to process.",
        processed: 0,
      });
    }

    const allIds = pendingComms.map((c) => c.id);

    // Simulate ~5% failure rate
    const failRate = 0.05;
    const failedIds = allIds.filter(() => Math.random() < failRate);
    const deliveredIds = allIds.filter((id) => !failedIds.includes(id));

    // Bulk update statuses
    const [deliveredResult, failedResult] = await Promise.all([
      deliveredIds.length > 0
        ? prisma.communication.updateMany({
            where: { id: { in: deliveredIds } },
            data: { status: "DELIVERED" },
          })
        : Promise.resolve({ count: 0 }),
      failedIds.length > 0
        ? prisma.communication.updateMany({
            where: { id: { in: failedIds } },
            data: { status: "FAILED" },
          })
        : Promise.resolve({ count: 0 }),
    ]);

    // Update all affected campaign statuses to COMPLETED or PARTIAL_FAILURE
    // Find campaigns that had pending comms
    const affectedCampaignIds = await prisma.communication
      .findMany({
        where: { id: { in: allIds } },
        select: { campaignId: true },
        distinct: ["campaignId"],
      })
      .then((rows) => rows.map((r) => r.campaignId));

    // For each campaign, check if any failed comms exist and update accordingly
    await Promise.all(
      affectedCampaignIds.map(async (campaignId) => {
        const failedCount = await prisma.communication.count({
          where: { campaignId, status: "FAILED" },
        });
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: failedCount > 0 ? "PARTIAL_FAILURE" : "COMPLETED",
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: `Processed ${allIds.length} pending communications.`,
      processed: allIds.length,
      delivered: deliveredResult.count,
      failed: failedResult.count,
    });
  } catch (err: any) {
    console.error("[DeliverAPI] Error processing pending communications:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process pending communications." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/campaign/deliver
 * Returns a count of how many communications are still PENDING.
 */
export async function GET(req: NextRequest) {
  try {
    const count = await prisma.communication.count({
      where: {
        status: "PENDING",
        campaign: { status: { not: "DRAFT" } },
      },
    });
    return NextResponse.json({ success: true, pendingCount: count });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch pending count." },
      { status: 500 }
    );
  }
}
