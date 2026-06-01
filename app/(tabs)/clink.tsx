import { useState } from "react";
import { AppSegmentedControl } from "@/components/common/AppSegmentedControl";
import ChatIndexScreen from "../chat";
import MatchScreen from "../match";

const clinkTabs = [
  { key: "match", label: "Match" },
  { key: "chats", label: "Chats" }
] as const;

export default function ClinkScreen() {
  const [tab, setTab] = useState("match");
  const segmentedControl = <AppSegmentedControl segments={clinkTabs} value={tab} onChange={setTab} />;

  return tab === "match"
    ? <MatchScreen beforeContent={segmentedControl} />
    : <ChatIndexScreen beforeContent={segmentedControl} />;
}
