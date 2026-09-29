import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useDemo } from "@/demo/engine";
import { sortieService } from "@/demo/services";
import { btn, Btn, KV, PageHeader, Panel, StatusBadge } from "@/components/app/ui";

export const Route = createFileRoute("/_ops/sorties/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Sortie ${params.id} | DhruvSetu` },
      {
        name: "description",
        content: "Sortie detail with check-in, delay, incident and end actions.",
      },
      { property: "og:title", content: `Sortie ${params.id} | DhruvSetu` },
      { property: "og:description", content: "Field sortie record (synthetic)." },
    ],
  }),
  component: SortieDetail,
  notFoundComponent: () => <p className="text-muted-foreground">Sortie not found.</p>,
});

function SortieDetail() {
  const { id } = Route.useParams();
  const { state, actions } = useDemo();
  const navigate = useNavigate();
  const s = sortieService.byId(state, id);
  if (!s) throw notFound();
  const live = s.status !== "COMPLETE";
  const [from, to] = s.route.split(" → ");
  return (
    <>
      <PageHeader
        eyebrow={`Sortie ${s.id}`}
        title={s.team}
        subtitle={s.route}
        badges={<StatusBadge status={s.status} />}
      />
      {s.status === "OVERDUE" && (
        <div className="mb-6 rounded-[10px] border border-critical/40 bg-critical/[0.04] p-5">
          <p className="font-semibold text-critical">⚠ Check-in overdue</p>
          <p className="mt-1 text-[14.5px] text-ink">
            Scheduled check-in at {s.nextCheckIn.replace(" (missed)", "")} was not received. Report
            a P0 incident from the Edge tablet or here.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/edge" className={btn("primary")}>
              Report from Edge tablet
            </Link>
            <Link to="/muster" className={btn()}>
              Open Muster
            </Link>
          </div>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Panel title="Sortie">
          <div className="mb-8 flex items-center gap-4">
            <span className="font-mono text-[15px] font-semibold tracking-[0.1em] text-ink">
              {from?.toUpperCase()}
            </span>
            <span className="relative h-px flex-1 bg-hairline">
              <span className="absolute left-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-teal" />
              <span
                className={`absolute right-0 top-1/2 size-2 -translate-y-1/2 rounded-full ${s.status === "OVERDUE" ? "bg-critical" : "bg-hairline"}`}
              />
            </span>
            <span className="font-mono text-[15px] font-semibold tracking-[0.1em] text-ink">
              {to?.toUpperCase()}
            </span>
          </div>
          <KV
            cols={3}
            items={[
              ["Status", <StatusBadge key="s" status={s.status} />],
              ["Departure", s.departure],
              ["Expected return", s.eta],
              ["Next check-in", s.nextCheckIn],
              ["Personnel", String(s.members)],
              ["Lead", s.lead],
            ]}
          />
        </Panel>
        <Panel title="Actions">
          <div className="grid gap-2">
            <Btn
              size="lg"
              variant="teal"
              disabled={!live}
              onClick={() => actions.sortieUpdate(s.id, "checkin")}
            >
              Check In
            </Btn>
            <Btn size="lg" disabled={!live} onClick={() => actions.sortieUpdate(s.id, "delay")}>
              Report Delay
            </Btn>
            <Btn
              size="lg"
              variant="danger"
              disabled={!live}
              onClick={() => {
                const iid = actions.createIncident({
                  type: "Field Distress",
                  location: to ?? "Field",
                  personnel: s.members,
                  description: `${s.team} on ${s.id} reported distress.`,
                });
                navigate({ to: "/incidents/$id", params: { id: iid } });
              }}
            >
              Report Incident
            </Btn>
            <Btn size="lg" disabled={!live} onClick={() => actions.sortieUpdate(s.id, "end")}>
              End Sortie
            </Btn>
            <div className="mt-3 border-t border-hairline pt-4">
              <p className="eyebrow mb-2 text-muted-foreground">Simulation</p>
              <Btn
                className="w-full"
                disabled={!live || s.status === "OVERDUE"}
                onClick={() => actions.sortieUpdate(s.id, "missed")}
              >
                Trigger missed check-in
              </Btn>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
