import { OptimizationAgent } from "./optimization.agent";

/**
 * Self-test checker for the Phase 9 AI Optimization Agent.
 * Run this to verify correctness of Gemini metric diagnostics analysis.
 */
export async function runOptimizationSelfTest() {
  console.log("==================================================");
  console.log("[TEST] Beginning Phase 9 AI Optimization Self-Test...");
  console.log("==================================================");

  // Example inputs matching the Phase 9 task definition
  const testCampaign = "Loyalist Retention Offer";
  const testChannel = "SMS";
  const testMetrics = {
    sent: 500,
    delivered: 420,
    failed: 80, // => 16% failed delivery rate
    pending: 0,
  };

  console.log(`[TEST] Input Metadata:
  Campaign: "${testCampaign}"
  Channel:  "${testChannel}"
  Metrics:  ${testMetrics.sent} Sent, ${testMetrics.delivered} Delivered, ${testMetrics.failed} Failed`);

  try {
    const result = await OptimizationAgent.generateRecommendation(
      testCampaign,
      testChannel,
      testMetrics
    );

    console.log("\n[TEST] Received Agent Output Payload:");
    console.log(JSON.stringify(result, null, 2));

    // 1. Assert schema structure presence
    if (!result.recommendation) {
      throw new Error("Assertion failed: missing 'recommendation' string parameter in response.");
    }
    if (!result.reason) {
      throw new Error("Assertion failed: missing 'reason' explanation in response.");
    }
    if (result.confidence === undefined || typeof result.confidence !== "number") {
      throw new Error("Assertion failed: missing 'confidence' numeric index in response.");
    }

    console.log("\n✓ ASSERT: All structural parameters present.");

    // 2. Assert value constraints
    if (result.confidence < 0 || result.confidence > 1) {
      throw new Error(`Assertion failed: confidence score ${result.confidence} is outside [0.0, 1.0] domain.`);
    }
    console.log("✓ ASSERT: Confidence rating bounded correctly.");

    // 3. Print verification success badge
    console.log("\n==================================================");
    console.log("🎉 SUCCESS: Phase 9 AI Optimization Agent self-test passed!");
    console.log("==================================================");
    return { success: true, result };
  } catch (error: any) {
    console.error("\n❌ SELF-TEST FAILURE:", error.message || error);
    console.log("==================================================");
    return { success: false, error: error.message };
  }
}
