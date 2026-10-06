"use client";

import { Badge, type Tone } from "./ui";
import { useI18n } from "@/shiftcomply/lib/i18n";
import {
  contractStatusLabel,
  docStatusLabel,
  roomStatusLabel,
  type ContractStatus,
  type DocStatus,
  type RoomStatus,
} from "@/shiftcomply/lib/derive";

export const contractTone: Record<ContractStatus, Tone> = {
  active: "success",
  permanent: "success",
  expiring: "warning",
  expired: "danger",
  upcoming: "info",
  unsigned: "warning",
};

export const roomTone: Record<RoomStatus, Tone> = {
  vacant: "neutral",
  occupied: "info",
  "checkout-soon": "warning",
  overdue: "danger",
};

export const docTone: Record<DocStatus, Tone> = {
  valid: "success",
  expiring: "warning",
  expired: "danger",
  missing: "danger",
};

export function ContractBadge({ status }: { status: ContractStatus }) {
  const { t } = useI18n();
  return <Badge tone={contractTone[status]}>{t(contractStatusLabel[status])}</Badge>;
}

export function RoomBadge({ status }: { status: RoomStatus }) {
  const { t } = useI18n();
  return <Badge tone={roomTone[status]}>{t(roomStatusLabel[status])}</Badge>;
}

export function DocBadge({ status }: { status: DocStatus }) {
  const { t } = useI18n();
  return <Badge tone={docTone[status]}>{t(docStatusLabel[status])}</Badge>;
}
