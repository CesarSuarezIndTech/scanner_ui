import ScannerForm from "@/components/ScannerForm";

export default function Home() {
  return (
    <div className="font-sans flex items-center min-h-screen gap-16 bg-white">
      <main className="w-full flex justify-center">
        <ScannerForm />
      </main>
    </div>
  );
}
