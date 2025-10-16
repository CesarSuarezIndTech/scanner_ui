import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  }

  // Evitar traversal: solo aceptar nombre base sin rutas
  const safeName = path.basename(filename);
  if (safeName !== filename) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  // Directorios permitidos donde se generan / copian los reportes
  const root = process.cwd();
  const primaryDir = path.join(root, "scripts", "scanScript", "recon_reports");
  const fallbackDir = path.join(root, "recon_reports");

  // Resolver ruta del archivo buscando primero en el directorio del script
  const primaryPath = path.join(primaryDir, safeName);
  const fallbackPath = path.join(fallbackDir, safeName);

  let filePath = "";
  if (fs.existsSync(primaryPath)) {
    filePath = primaryPath;
  } else if (fs.existsSync(fallbackPath)) {
    filePath = fallbackPath;
  } else {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const content = fs.readFileSync(filePath);
    const contentType = safeName.endsWith(".txt") ? "text/plain; charset=utf-8" : "application/octet-stream";
    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[download] Error reading file:", err);
    return NextResponse.json({ error: "Error reading file" }, { status: 500 });
  }
}
