import { isAdmin, WAITLIST_COLUMNS, type WaitlistEntry } from "@/lib/admin";
import { COUNTRIES, MODELS, TICKET_RANGES, labelOf, type ProjectModel } from "@/lib/domain";
import { createClient } from "@/lib/supabase/server";

// CSV export of the whole waitlist, formatted for Excel in French (semicolons, UTF-8 BOM).
export async function GET() {
  if (!(await isAdmin())) return new Response("Not found", { status: 404 });

  const supabase = await createClient();
  const rows: WaitlistEntry[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("waitlist")
      .select(WAITLIST_COLUMNS)
      .order("created_at", { ascending: true })
      .range(from, from + 999)
      .overrideTypes<WaitlistEntry[], { merge: false }>();
    if (error) return new Response("Export failed", { status: 500 });
    rows.push(...data);
    if (data.length < 1000) break;
  }

  const header = ["E-mail", "Nom", "Résidence", "Pays", "Montant envisagé", "Intérêts", "Sukuk", "Source", "Inscrit le"];
  const lines = rows.map((row) =>
    [
      row.email,
      row.full_name ?? "",
      row.residency === "resident" ? "Tunisie" : "Étranger",
      labelOf(COUNTRIES, row.country),
      row.ticket_range ? labelOf(TICKET_RANGES, row.ticket_range) : "",
      row.interests.map((model) => MODELS[model as ProjectModel]?.label ?? model).join(", "),
      row.prefers_sukuk ? "Oui" : "Non",
      row.source ?? "",
      row.created_at,
    ]
      .map(csvCell)
      .join(";"),
  );
  const csv = "﻿" + [header.map(csvCell).join(";"), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="liste-attente-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

// Quotes every cell, and neutralises values a spreadsheet would run as a formula.
function csvCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
