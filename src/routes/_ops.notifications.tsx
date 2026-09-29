import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import { LevelDot } from "@/components/app/Shell";
import { Btn, EmptyState, Mono, PageHeader, Panel, Tabs } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ops/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | DhruvSetu" },
      {
        name: "description",
        content:
          "Operational notifications: critical, attention, upcoming and sync events linked to exact records.",
      },
      { property: "og:title", content: "Notifications | DhruvSetu" },
      { property: "og:description", content: "Operational alerts that open the exact record." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const { state, actions } = useDemo();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Open");
  const list = state.notifications.filter((n) =>
    tab === "Open" ? !n.resolved : tab === "Resolved" ? n.resolved : true,
  );
  return (
    <>
      <PageHeader
        eyebrow="Command"
        title="Notifications"
        actions={<Btn onClick={actions.markAllRead}>Mark all read</Btn>}
      />
      <Tabs tabs={["Open", "Resolved", "All"]} value={tab} onChange={setTab} />
      <Panel bodyClass="p-2 md:p-2">
        {list.length === 0 ? (
          <EmptyState text="No notifications in this view. Resolved items move here once their record is handled." />
        ) : (
          <ul>
            {list.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    actions.markRead(n.id);
                    navigate({ to: n.href });
                  }}
                  className="flex min-h-16 w-full items-start gap-4 rounded-[8px] px-4 py-3.5 text-left hover:bg-surface"
                >
                  <LevelDot level={n.level} />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-[15px]",
                        n.read ? "text-muted-foreground" : "font-medium text-ink",
                      )}
                    >
                      {n.text}
                    </span>
                    <span className="font-mono text-[11.5px] tracking-[0.08em] text-muted-foreground">
                      {n.level}
                      {n.resolved ? " · RESOLVED" : ""}
                    </span>
                  </span>
                  <Mono className="text-muted-foreground">{n.ts}</Mono>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
