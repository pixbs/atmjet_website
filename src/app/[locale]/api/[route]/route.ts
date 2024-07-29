import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    NextResponse.redirect('api/post_data', req)
}