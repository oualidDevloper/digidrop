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
    const res = await axios.get(`https://business-api.antistock.io/v1/dash/shops/${shopId}/categories`, {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    return NextResponse.json({ success: true, data: res.data.data });
  } catch (error: any) {
    console.error("Fetch categories error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
