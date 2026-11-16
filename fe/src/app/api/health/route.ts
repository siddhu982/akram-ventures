import net from 'net';
import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function checkPort(): Promise<boolean> {
  return new Promise((resolve) => {
    const { hostname, port } = new URL(STRAPI_URL);
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error',   () => { socket.destroy(); resolve(false); });
    socket.once('timeout', () => { socket.destroy(); resolve(false); });
    socket.connect(parseInt(port) || 1337, hostname);
  });
}

export async function GET() {
  const up = await checkPort();
  return NextResponse.json(
    { up },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
