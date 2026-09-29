import { useState } from "react";
import type { ComplianceRow } from "@/demo/types";
import { Btn, DataTable, EmptyState, Mono, Panel, StatusBadge, Toolbar } from "./ui";

const BADGE_COLS = new Set(["Status", "Result", "Level", "State"]);

/** Generic operational table for simple register-style modules. */
export function RecordTable({
  rows,
  mono = [],
  title,
}: {
  rows: ComplianceRow[];
  mono?: string[];
  title?: string;
}) {
  const [q, setQ] = useState("");
  const keys = rows[0] ? Object.keys(rows[0]) : [];
  const filtered = rows.filter(
    (r) => !q || Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <Panel title={title}>
      <Toolbar search={q} onSearch={setQ} placeholder="Search records" />
      <DataTable<ComplianceRow>
        rows={filtered}
        rowKey={(r) => Object.values(r).join("|")}
        empty={
          <EmptyState
            text="No records currently match this search."
            action={<Btn onClick={() => setQ("")}>Clear Filters</Btn>}
          />
        }
        columns={keys.map((k, i) => ({
          key: k,
          header: k,
          primary: i === 0,
          render: (r) =>
            BADGE_COLS.has(k) ? (
              <StatusBadge status={r[k]} />
            ) : mono.includes(k) || i === 0 ? (
              <Mono className={i === 0 ? "font-medium" : ""}>{r[k]}</Mono>
            ) : (
              r[k]
            ),
        }))}
      />
    </Panel>
  );
}
