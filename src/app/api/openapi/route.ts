import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "CRM - AI-Powered Audience & Campaign CRM APIs",
      version: "1.0.0",
      description: "Interactive API documentation for the CRM marketing pipeline, enabling bulk data ingestion, AI-guided audience segmentation, campaign generation, analytical optimizations, and delivery webhook processing.",
      contact: {
        name: "CRM Developer Support",
        email: "[EMAIL_ADDRESS]"
      }
    },
    servers: [
      {
        url: "/api",
        description: "Local Proxy Server Base Path"
      }
    ],
    paths: {
      "/dashboard/stats": {
        get: {
          summary: "Retrieve CRM statistics and data snapshots",
          description: "Fetches aggregated KPIs for the dashboard, including total customers, total orders, total revenue, calculation of client lifetime spend, and slices of recent customers and orders.",
          responses: {
            "200": {
              description: "Returns general stats, customer logs, and recent order transactions.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      stats: {
                        type: "object",
                        properties: {
                          totalCustomers: { type: "integer" },
                          totalOrders: { type: "integer" },
                          totalRevenue: { type: "number" },
                          calculatedSpend: { type: "number" }
                        }
                      },
                      customers: { type: "array" },
                      orders: { type: "array" }
                    }
                  }
                }
              }
            },
            "500": {
              description: "Failed to retrieve statistics."
            }
          }
        }
      },
      "/segmentation": {
        post: {
          summary: "Segment CRM audience with AI prompt expansion",
          description: "Given a natural language prompt (e.g., 'customers who purchased premium goods'), passes the parameters to the Gemini-guided agent to build a structured PostgreSQL query, execute it, and return matching customers.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["prompt"],
                  properties: {
                    prompt: {
                      type: "string",
                      description: "Natural language query representing customer profiles to segment.",
                      example: "All customers from New York who spent over $200"
                    }
                  }
                }
              }
            },
            description: "Natural language prompt guidelines."
          },
          responses: {
            "200": {
              description: "Returns matching customer lists and details on the SQL filter.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      audienceSize: { type: "integer" },
                      customers: { type: "array" },
                      sqlQuery: { type: "string" },
                      explanation: { type: "string" }
                    }
                  }
                }
              }
            },
            "400": {
              description: "Invalid input. A prompt string is required."
            },
            "500": {
              description: "Internal AI processing error."
            }
          }
        }
      },
      "/campaign": {
        post: {
          summary: "Perform campaign operations (Design, Save, or Launch)",
          description: "A orchestrator endpoint that handles a specified action: designing draft contents based on objectives, creating simple database records (saving drafts), or launching communication messages to your pipeline dispatcher.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["action"],
                  properties: {
                    action: {
                      type: "string",
                      enum: ["generate", "save", "launch"],
                      description: "Action to perform on the campaign subsystem."
                    },
                    goal: {
                      type: "string",
                      description: "Goal description. Required ONLY when action is 'generate'.",
                      example: "Increase sales of winter fleece jackets to regular buyers"
                    },
                    name: {
                      type: "string",
                      description: "Campaign name designation. Required when action is 'save' or 'launch'."
                    },
                    channel: {
                      type: "string",
                      description: "Transmission mode (e.g. EMAIL, SMS, WHATSAPP). Required when action is 'save' or 'launch'."
                    },
                    message: {
                      type: "string",
                      description: "Core communication copy drafting content. Required when action is 'save' or 'launch'."
                    },
                    reason: {
                      type: "string",
                      description: "Optional notes for the campaign description. Used when action is 'save'."
                    },
                    audiencePrompt: {
                      type: "string",
                      description: "Underlying filters applied to reach relevant customers. Required when action is 'launch'."
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Response keys depend on the action executed.",
              content: {
                "application/json": {
                  schema: {
                    type: "object"
                  }
                }
              }
            },
            "400": {
              description: "Validation issues regarding the required fields for the specific action."
            },
            "500": {
              description: "Internal services error compiling campaign assets."
            }
          }
        },
        get: {
          summary: "Fetch campaign drafts or combined live metrics",
          description: "Returns saved campaign configurations or detailed communication analytics stats based on the input query parameter.",
          parameters: [
            {
              name: "type",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "If set to 'metrics', fetches combined live metrics, dispatch tallies, and message logs. Otherwise, returns saved campaign drafts."
            }
          ],
          responses: {
            "200": {
              description: "Array of saved drafts or metrics reports.",
              content: {
                "application/json": {
                  schema: { type: "object" }
                }
              }
            },
            "500": {
              description: "Failure reading database logs."
            }
          }
        },
        delete: {
          summary: "Remove campaign drafts",
          description: "Strips a campaign out of local tracking buffers based on its design ID.",
          parameters: [
            {
              name: "id",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Unique design ID of the campaign draft to delete."
            }
          ],
          responses: {
            "200": {
              description: "Successfully processed deletion request."
            },
            "400": {
              description: "Missing expected ID query parameter."
            },
            "500": {
              description: "General DB connection failure."
            }
          }
        }
      },
      "/optimization": {
        get: {
          summary: "Retrieve analytical insights or recommendations for a campaign",
          description: "Yields a list of previous AI advisor insights or runs analysis for target campaigns parameters.",
          parameters: [
            {
              name: "campaignId",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Target database ID linking back to the campaign."
            }
          ],
          responses: {
            "200": {
              description: "Array of insight cards and recommendations logs.",
              content: {
                "application/json": {
                  schema: { type: "object" }
                }
              }
            },
            "400": {
              description: "Missing required query key."
            }
          }
        },
        post: {
          summary: "Trigger immediate agent advice generation",
          description: "Invokes optimization routines on target campaigns, using model evaluation of message delivery logs.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["campaignId"],
                  properties: {
                    campaignId: {
                      type: "string",
                      description: "The campaign's physical database ID for review.",
                      example: "cm1-ex-9892-id"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Generated recommendation insights objects saved to the database."
            }
          }
        }
      },
      "/webhooks/delivery": {
        post: {
          summary: "Ingest external channel transmission logs (simulation)",
          description: "Webhook callback handler for the SMS/Email Dispatcher. Links delivered or failed events back to specific communications to update delivery metrics in real-time.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["communicationId", "status"],
                  properties: {
                    communicationId: {
                      type: "string",
                      description: "Target database ID pointing to a registered dispatch list block."
                    },
                    status: {
                      type: "string",
                      enum: ["DELIVERED", "FAILED"],
                      description: "Webhook status notification sent by the carrier."
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Event has been logged, metrics compiled, and the campaign state recalculated."
            },
            "400": {
              description: "Invalid or missing inputs."
            },
            "500": {
              description: "Verification database error."
            }
          }
        }
      },
      "/upload/customers": {
        post: {
          summary: "Bulk ingest customer records via CSV",
          description: "Parses CSV formatted rows representing client listings (CSV details inside 'csv' block), inserts valid customers to PostgreSQL, dynamically standardizes metadata fields, and displays skips.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["csv"],
                  properties: {
                    csv: {
                      type: "string",
                      description: "Raw CSV text representation of customers.",
                      example: "name,email,phone,location\nJohn Doe,john@test.com,1234567,New York"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Bulk data parsed and matching segments established."
            },
            "400": {
              description: "Erroneous CSV formatting detected."
            }
          }
        }
      },
      "/upload/orders": {
        post: {
          summary: "Bulk ingest order transactions via CSV",
          description: "Ingests structural transaction arrays to establish buyer order totals, item links, purchase dates, and revenues dynamically recalculating customer metrics.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["csv"],
                  properties: {
                    csv: {
                      type: "string",
                      description: "Raw CSV text representation of orders.",
                      example: "customerEmail,totalAmount,items\njohn@test.com,250.00,Premium Fleece Hoodie"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Orders imported successfully into primary DB."
            },
            "400": {
              description: "Parsing or binding failures."
            }
          }
        }
      },
      "/dashboard/seed": {
        post: {
          summary: "Trigger database content seeding",
          description: "Wipes and builds default test rows representing customer listings, mock purchase activities, and draft/launched campaigns to support rapid platform evaluations.",
          responses: {
            "200": {
              description: "Database seeded successfully."
            }
          }
        }
      },
      "/dashboard/reset": {
        post: {
          summary: "Reset databases cleanly",
          description: "Purges custom user segments, historical dispatches, metrics, and customer files back to zero to clear states.",
          responses: {
            "200": {
              description: "State cleared successfully."
            }
          }
        }
      }
    }
  };

  return NextResponse.json(spec);
}
