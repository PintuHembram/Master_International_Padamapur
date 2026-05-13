import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { ReactNode } from "react";

export default function ModuleStub({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="p-12 text-center border-dashed">
        <Construction className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold mb-1">Module coming in upcoming phase</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          This module is part of the phased ERP rollout. The data model and UI will be wired up in a follow-up turn.
        </p>
        {children && <div className="mt-6">{children}</div>}
      </Card>
    </div>
  );
}
