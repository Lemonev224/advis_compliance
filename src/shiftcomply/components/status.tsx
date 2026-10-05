import { Badge, type Tone } from "./ui";
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
  return <Badge tone={contractTone[status]}>{contractStatusLabel[status]}</Badge>;
}

export function RoomBadge({ status }: { status: RoomStatus }) {
  return <Badge tone={roomTone[status]}>{roomStatusLabel[status]}</Badge>;
}

export function DocBadge({ status }: { status: DocStatus }) {
  return <Badge tone={docTone[status]}>{docStatusLabel[status]}</Badge>;
}
