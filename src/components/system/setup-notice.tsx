import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SetupNotice() {
  return (
    <Alert className="border-amber-300/70 bg-amber-50 text-amber-950">
      <AlertCircle className="size-4" />
      <AlertTitle>Supabase is not configured yet</AlertTitle>
      <AlertDescription className="text-amber-900/90">
        <p>
          Add these values to <code className="font-mono text-xs">.env.local</code> and
          restart the dev server:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-md bg-amber-950/5 p-3 font-mono text-[11px] leading-relaxed">
          {`NEXT_PUBLIC_SUPABASE_URL=...\nNEXT_PUBLIC_SUPABASE_ANON_KEY=...\nNEXT_PUBLIC_SITE_URL=http://localhost:3000`}
        </pre>
      </AlertDescription>
    </Alert>
  );
}
