import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("apiKey");
  const shopId = searchParams.get("shopId");

  if (!apiKey || !shopId) {
    return NextResponse.json({ error: "API Key and Shop ID are required" }, { status: 400 });
  }

  try {
    const [catRes, payRes] = await Promise.all([
      axios.get(`https://business-api.antistock.io/v1/dash/shops/${shopId}/categories`, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      }),
      axios.get(`https://business-api.antistock.io/v1/dash/shops/${shopId}/settings/payments`, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      })
    ]);

    const gateways = payRes.data.data.paymentsGateways.map((g: any) => ({
      id: g.id,
      name: g.gatewayName || g.name || "Unknown"
    }));

    return NextResponse.json({ 
      success: true, 
      categories: catRes.data.data,
      gateways: gateways 
    });
  } catch (error: any) {
    console.error("Fetch debug error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to fetch shop data" }, { status: 500 });
  }
}
