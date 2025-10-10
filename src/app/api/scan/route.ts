import { NextRequest } from "next/server";
import { spawn } from "child_process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function badRequest(msg: string) {
  return new Response(JSON.stringify({ error: msg }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

// Helper to format SSE messages
function sseFormat(data: string, event?: string) {
  const lines = data.split(/\r?\n/);
  const body = lines.map((l) => `data: ${l}`).join("\n");
  return (event ? `event: ${event}\n` : "") + body + "\n\n";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("target")?.trim();
  const mode = (searchParams.get("mode") || "quick").trim();

  if (!target) return badRequest("Parametro 'target' es requerido");
  if (!/^(?:\d{1,3}\.){3}\d{1,3}$|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(target)) {
    return badRequest("'target' no parece ser una IP o dominio válido");
  }
  if (!["quick", "full"].includes(mode)) return badRequest("'mode' inválido");

  // Resolve python command and script path from env or defaults
  const pythonCmd = process.env.PYTHON_CMD || "python3"; // typical on Ubuntu
  const scriptPath = process.env.PY_SCRIPT || `${process.cwd()}/scripts/scan.py`;

  let child: ReturnType<typeof spawn> | null = null;
  let closed = false;

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Start process
      try {
        child = spawn(pythonCmd, [scriptPath, target, mode], {
          cwd: process.cwd(),
          env: process.env,
          stdio: ["ignore", "pipe", "pipe"],
        });

        controller.enqueue(
          encoder.encode(sseFormat(`Ejecutando: ${pythonCmd} ${scriptPath} ${target} ${mode}`))
        );

        child.stdout?.on("data", (chunk: Buffer) => {
          if (closed) return;
          controller.enqueue(encoder.encode(sseFormat(chunk.toString())));
        });

        child.stderr?.on("data", (chunk: Buffer) => {
          if (closed) return;
          controller.enqueue(encoder.encode(sseFormat(chunk.toString(), "stderr")));
        });

        child.on("error", (err) => {
          if (closed) return;
          controller.enqueue(
            encoder.encode(sseFormat(`[ERROR] No se pudo iniciar el proceso: ${err.message}`, "stderr"))
          );
          closed = true;
          try { child?.kill("SIGTERM"); } catch {}
          controller.close();
        });

        child.on("close", (code, signal) => {
          if (closed) return;
          const msg = signal
            ? `Proceso terminado por señal: ${signal}`
            : `Proceso finalizado con código: ${code}`;
          controller.enqueue(encoder.encode(sseFormat(msg)));
          closed = true;
          controller.close();
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Fallo desconocido";
        controller.enqueue(
          encoder.encode(sseFormat(`[ERROR] ${message}`, "stderr"))
        );
        closed = true;
        controller.close();
      }
    },
    cancel() {
      // Client closed connection; kill child process
      closed = true;
      try {
        if (child && !child.killed) child.kill("SIGTERM");
      } catch {}
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
