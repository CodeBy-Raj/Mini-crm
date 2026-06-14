import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";
import Papa from "papaparse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { csv } = body;

    if (!csv) {
      return NextResponse.json(
        { error: "No CSV content provided in request body." },
        { status: 400 }
      );
    }

    // Parse the CSV data
    const parseResult = Papa.parse(csv, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: true,
    });

    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return NextResponse.json(
        { error: "Failed to parse CSV. Please verify formatting.", details: parseResult.errors },
        { status: 400 }
      );
    }

    const importResults = await OrderService.importOrdersFromParsedRows(parseResult.data);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${importResults.successCount} orders.`,
      skipped: importResults.skippedCount,
      errors: importResults.errors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during import." },
      { status: 500 }
    );
  }
}
