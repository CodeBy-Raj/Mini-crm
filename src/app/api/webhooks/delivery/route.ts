import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { communicationId, status } = body;

    if (!communicationId || !status) {
       return NextResponse.json(
         { error: "Missing communicationId or status in body." },
         { status: 400 }
       );
    }

    if (status !== "DELIVERED" && status !== "FAILED") {
      return NextResponse.json(
        { error: "Invalid status value. Must be DELIVERED or FAILED." },
        { status: 400 }
      );
    }

    // 1. Update individual Communication log status
    const updatedComm = await prisma.communication.update({
      where: { id: communicationId },
      data: { status },
    });

    console.log(`[Webhook Delivery] Updated communication ${communicationId} -> ${status}`);

    // 2. Query other siblings to calculate Campaign Status progression
    const campaignId = updatedComm.campaignId;
    const pendingCount = await prisma.communication.count({
      where: {
        campaignId,
        status: "PENDING",
      },
    });

    if (pendingCount === 0) {
      // Transition overall Campaign status based on whether there were any underlying notification failures
      const failedCount = await prisma.communication.count({
        where: {
          campaignId,
          status: "FAILED",
        },
      });

      const campaignStatus = failedCount > 0 ? "PARTIAL_FAILURE" : "COMPLETED";

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: campaignStatus },
      });
      console.log(`[Webhook Delivery] Campaign [${campaignId}] completely processed. Setting status to ${campaignStatus}.`);
    }

    return NextResponse.json({
      success: true,
      message: "Communication status and campaign metrics propagated successfully.",
      communication: {
        id: updatedComm.id,
        status: updatedComm.status,
        campaignId,
      },
      campaignFullyDispatched: pendingCount === 0,
    });
  } catch (err: any) {
    console.error("API Webhooks Delivery Error:", err);
    return NextResponse.json(
      { error: err.message || "Endpoint error occurred." },
      { status: 500 }
    );
  }
}
