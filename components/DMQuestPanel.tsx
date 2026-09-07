"use client";

import { useState } from "react";
import DMQuestForm from "./DMQuestForm";
import DMQuestQueue from "./DMQuestQueue";

export default function DMQuestPanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <DMQuestForm onCreated={() => setRefreshKey((k) => k + 1)} />
      <DMQuestQueue refreshKey={refreshKey} />
    </div>
  );
}
