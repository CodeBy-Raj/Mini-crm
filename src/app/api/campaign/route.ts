import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CampaignService } from "@/services/campaign.service";
import { CampaignLaunchService } from "@/services/campaign-launch.service";
import { CampaignMetricsService } from "@/services/campaign-metrics.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "generate") {
      const { goal } = body;
      if (!goal || typeof goal !== "string") {
        return NextResponse.json(
          { error: "A valid Campaign Goal string is required." },
          { status: 400 }
        );
      }
      const data = await CampaignService.designCampaign(goal.trim());
      return NextResponse.json({ success: true, ...data });
    }

    if (action === "save") {
      const { name, channel, message, reason } = body;
      if (!name || !channel || !message) {
        return NextResponse.json(
          { error: "Campaign name, channel, and message draft are required to save a draft." },
          { status: 400 }
        );
      }
      const saved = await CampaignService.saveDraft({
        name: name.trim(),
        channel: channel.trim(),
        message: message.trim(),
        reason: reason ? reason.trim() : "Customized user draft configuration.",
      });
      return NextResponse.json({ success: true, campaign: saved });
    }

    if (action === "launch") {
      const { name, channel, message, audiencePrompt } = body;
      if (!name || !channel || !message || !audiencePrompt) {
        return NextResponse.json(
          { error: "Campaign name, channel, message draft, and audience prompt are required to launch a campaign." },
          { status: 400 }
        );
      }

      const launchResult = await CampaignLaunchService.launchCampaign({
        name: name.trim(),
        channel: channel.trim(),
        message: message.trim(),
        audiencePrompt: audiencePrompt.trim(),
      });

      // Asynchronously trigger communication sending to the channel-service
      if (launchResult.success && launchResult.communications && launchResult.communications.length > 0) {
        // Since Vercel kills background tasks and the mock channel service is not running,
        // we simulate the external channel service delivery here by updating the records directly.
        (async () => {
          console.log(`[Campaign Dispatcher] Simulating async dispatch of ${launchResult.communications.length} messages.`);
          const commIds = launchResult.communications.map((c) => c.id);
          
          // Add a small delay to simulate network transfer, making the UI animation visible
          await new Promise((resolve) => setTimeout(resolve, 2000));
          
          const failRate = 0.05; // 5% fail rate
          const failedIds = commIds.filter(() => Math.random() < failRate);
          const deliveredIds = commIds.filter((id) => !failedIds.includes(id));
          
          if (deliveredIds.length > 0) {
            await prisma.communication.updateMany({
              where: { id: { in: deliveredIds } },
              data: { status: "DELIVERED" }
            });
          }
          if (failedIds.length > 0) {
            await prisma.communication.updateMany({
              where: { id: { in: failedIds } },
              data: { status: "FAILED" }
            });
          }
          
          await prisma.campaign.update({
            where: { id: launchResult.campaign.id },
            data: { status: failedIds.length > 0 ? "PARTIAL_FAILURE" : "COMPLETED" }
          });
          console.log(`[Campaign Dispatcher] Simulation complete.`);
        })();
      }

      return NextResponse.json({
        success: true,
        campaign: launchResult.campaign,
        audienceSize: launchResult.audienceSize,
        communicationsGenerated: launchResult.communicationsGenerated,
      });
    }

    return NextResponse.json({ error: "Invalid action payload" }, { status: 400 });
  } catch (err: any) {
    console.error("API Campaign POST Error:", err);
    return NextResponse.json(
      { error: err.message || "Endpoint error occurred." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "metrics") {
      const metricsData = await CampaignMetricsService.getCombinedExecutionMetrics();
      return NextResponse.json({
        success: true,
        campaigns: metricsData.campaigns,
        communications: metricsData.events,
        global: metricsData.global,
      });
    }

    const drafts = await CampaignService.getAllDrafts();
    return NextResponse.json({ success: true, drafts });
  } catch (err: any) {
    console.error("API Campaign GET Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch saved drafts." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing required draft ID." }, { status: 400 });
    }
    await CampaignService.deleteDraft(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete compilation." },
      { status: 500 }
    );
  }
}
