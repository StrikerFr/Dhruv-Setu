import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app/Shell";

export const Route = createFileRoute("/_ops")({
  component: OpsLayout,
});

function OpsLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
