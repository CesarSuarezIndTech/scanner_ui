This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Uso en Ubuntu con Python y salida en consola del frontend

Este proyecto incluye una ruta API (`/api/scan`) que ejecuta un script de Python y transmite su salida al frontend mediante Server-Sent Events (SSE). El componente `ScannerForm` se conecta a esa ruta y muestra la “consola” en vivo.

### Requisitos en Ubuntu

- Node.js 18+ y npm
- Python 3 (recomendado `python3` en PATH) y `pip`

### Instalación

1. Instalar dependencias Node:

```bash
npm ci
```

2. Asegurarse de tener Python 3 instalado y en PATH. Si el ejecutable no es `python3`, puedes configurar:

```bash
export PYTHON_CMD=python
```

3. (Opcional) Si tu script Python está en otra ruta distinta a `scripts/scan.py`:

```bash
export PY_SCRIPT=/ruta/a/tu/script.py
```

### Ejecutar en desarrollo y exponer por IP

Arranca el servidor enlazado a `0.0.0.0` para que sea accesible desde la red local:

```bash
npm run dev
```

Luego abre en otro dispositivo el navegador con `http://<IP_DEL_PC_UBUNTU>:3000`.

Para producción:

```bash
npm run build
npm run start
```

### Firewall y puertos

Asegúrate de permitir el puerto 3000 en el firewall de Ubuntu si está activo:

```bash
sudo ufw allow 3000/tcp
```

### Notas

- La API usa `python3` por defecto. Define `PYTHON_CMD` si necesitas cambiarlo.
- Puedes reemplazar `scripts/scan.py` por tu script real; los argumentos recibidos son: `<target> <mode>`.
- Al cerrar la pestaña o pulsar “DETENER”, se envía una cancelación que termina el proceso Python.
