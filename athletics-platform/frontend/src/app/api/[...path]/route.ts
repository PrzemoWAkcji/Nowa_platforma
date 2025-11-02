import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path);
}

async function handleRequest(request: NextRequest, pathSegments: string[]) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
  const path = pathSegments.join("/");
  const url = `${apiUrl}/${path}`;

  try {
    const headers = new Headers();

    // Copy headers from the original request
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    // Remove host header to avoid conflicts
    headers.delete("host");

    const body = request.method !== "GET" ? await request.text() : undefined;

    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
    });

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
