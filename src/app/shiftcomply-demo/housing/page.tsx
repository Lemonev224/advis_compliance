"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BedDouble, KeyRound, Plus } from "lucide-react";
import { Button, Card, cx, Drawer, inputClass, KeyValue, PageHeader, Progress, Segmented } from "@/shiftcomply/components/ui";
import { RoomBadge } from "@/shiftcomply/components/status";
import { AddRoomModal, AssignRoomModal, RenewContractModal } from "@/shiftcomply/components/actions";
import { useStore } from "@/shiftcomply/lib/store";
import { roomStatus, type RoomStatus } from "@/shiftcomply/lib/derive";
import { daysUntil } from "@/shiftcomply/lib/dates";
import { useI18n } from "@/shiftcomply/lib/i18n";

type Filter = "all" | RoomStatus;

export default function HousingPage() {
  const { rooms, employees, checkOut, extendStay, deleteRoom, canEdit, createDemoHotel, myHotels } = useStore();
  const { t, fmt } = useI18n();
  const [addingRoom, setAddingRoom] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [openRoom, setOpenRoom] = useState<string | null>(null);
  const [assignFor, setAssignFor] = useState<string | null | undefined>(undefined);
  const [renewId, setRenewId] = useState<string | null>(null);
  const [newCheckout, setNewCheckout] = useState("");

  // Allow deep links like /housing?room=208
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) setOpenRoom(room);
    const f = params.get("filter");
    if (f === "overdue" || f === "vacant" || f === "occupied" || f === "checkout-soon") setFilter(f);
  }, []);

  const states = useMemo(() => rooms.map((r) => ({ room: r, ...roomStatus(r, employees) })), [rooms, employees]);
  const count = (s: RoomStatus) => states.filter((x) => x.status === s).length;
  const visible = states.filter((x) => filter === "all" || x.status === filter);
  const byNumber = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });
  const buildings = Array.from(new Set(states.map((x) => x.room.building || "Staff rooms"))).sort(byNumber);
  const occupancy = buildings.map((b) => {
    const inB = states.filter((x) => (x.room.building || "Staff rooms") === b);
    return { building: b, total: inB.length, occupied: inB.filter((x) => x.status !== "vacant").length };
  });

  const current = states.find((x) => x.room.id === openRoom);

  return (
    <>
      <PageHeader
        title={t("Staff housing")}
        description={
          rooms.length
            ? t("{n} of {total} staff rooms occupied", { n: rooms.length - count("vacant"), total: rooms.length })
            : t("Add your staff rooms to start assigning employees")
        }
        actions={
          canEdit && (
            <>
              <Button onClick={() => setAddingRoom(true)}>
                <Plus size={16} />
                {t("Add room")}
              </Button>
              <Button variant="primary" onClick={() => setAssignFor(null)}>
                <KeyRound size={16} />
                {t("Assign room")}
              </Button>
            </>
          )
        }
      />

      {rooms.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <BedDouble size={28} strokeWidth={1.5} className="text-subtle" />
          <h2 className="mt-3 text-[16px] font-semibold">{t("No staff rooms yet")}</h2>
          <p className="mt-1 max-w-md text-[13px] text-muted">
            {t(
              "Add each room in your staff residence. You can then assign employees, track checkout dates and spot anyone still in a room after their contract ends.",
            )}
          </p>
          {canEdit && (
            <>
              <Button variant="primary" className="mt-5" onClick={() => setAddingRoom(true)}>
                <Plus size={16} />
                {t("Add your first room")}
              </Button>
              <p className="mt-4 text-[13px] text-muted">
                {t("Want to see how it works first?")}{" "}
                <button onClick={() => createDemoHotel()} className="font-medium text-primary hover:underline">
                  {myHotels.some((h) => h.isDemo) ? t("Open the demo hotel") : t("Try the demo hotel")}
                </button>
              </p>
            </>
          )}
        </Card>
      ) : (
        <>
      <Card className="mb-5">
        <div className="flex items-center justify-between border-b border-line px-[18px] py-3.5">
          <span className="text-[15px] font-semibold">{t("Occupancy by building")}</span>
          <span className="text-[13px] text-muted tabular">
            {t("{n} of {total} rooms", { n: rooms.length - count("vacant"), total: rooms.length })}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 px-[18px] py-4 md:grid-cols-2 xl:grid-cols-3">
          {occupancy.map((o) => (
            <div key={o.building}>
              <div className="mb-1.5 flex justify-between text-[13px]">
                <span>{t(o.building)}</span>
                <span className="text-muted tabular">{t("{n} / {total} rooms", { n: o.occupied, total: o.total })}</span>
              </div>
              <Progress value={o.occupied} max={o.total} />
            </div>
          ))}
        </div>
      </Card>

      <div className="mb-5">
        <Segmented
          value={filter}
          onChange={setFilter}
          items={[
            { value: "all", label: t("All rooms"), count: rooms.length },
            { value: "occupied", label: t("Occupied"), count: count("occupied") },
            { value: "checkout-soon", label: t("Checkout this week"), count: count("checkout-soon") },
            { value: "overdue", label: t("Overdue"), count: count("overdue") },
            { value: "vacant", label: t("Vacant"), count: count("vacant") },
          ]}
        />
      </div>

      <div className="space-y-6">
        {buildings
          .filter((b) => visible.some((x) => (x.room.building || "Staff rooms") === b))
          .map((building) => (
          <section key={building}>
            <h2 className="mb-2 text-[14px] font-semibold text-body">{t(building)}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {visible
                .filter((x) => (x.room.building || "Staff rooms") === building)
                .sort((a, b) => a.room.floor - b.room.floor || byNumber(a.room.id, b.room.id))
                .map(({ room, status, occupant }) => (
                  <button
                    key={room.id}
                    onClick={() => setOpenRoom(room.id)}
                    className={cx(
                      "flex flex-col justify-start rounded border bg-surface px-[18px] py-4 text-left transition-colors hover:border-primary/50",
                      status === "overdue" ? "border-danger/40" : "border-line",
                    )}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span>
                        <span className="block text-[18px] leading-tight font-semibold tabular">{room.id}</span>
                        <span className="text-[12px] text-muted">{t("Floor {floor}", { floor: room.floor })}</span>
                      </span>
                      <RoomBadge status={status} />
                    </div>
                    {occupant ? (
                      <div className="mt-3">
                        <div className="truncate text-[14px] font-medium text-ink">{occupant.name}</div>
                        <div className="truncate text-[13px] text-muted">{t(occupant.role)}</div>
                        <div className={cx("mt-2 text-[13px] tabular", status === "overdue" ? "text-danger" : "text-body")}>
                          {status === "overdue"
                            ? t("{n} days overdue", { n: Math.abs(daysUntil(occupant.checkout) ?? 0) })
                            : t("Checkout {date}", { date: fmt(occupant.checkout, false) })}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-[13px] text-muted">
                        {room.type === "Double" ? t("Double room, available") : t("Single room, available")}
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </section>
        ))}
        {visible.length === 0 && (
          <Card className="px-6 py-10 text-center text-[13px] text-muted">{t("No rooms in this view.")}</Card>
        )}
      </div>
        </>
      )}

      <Drawer
        open={!!current}
        onClose={() => {
          setOpenRoom(null);
          setNewCheckout("");
        }}
        title={current ? t("Room {room}", { room: current.room.id }) : ""}
      >
        {current && (
          <div className="space-y-5">
            <div>
              <RoomBadge status={current.status} />
              <div className="mt-3">
                <KeyValue label={t("Type")}>{t(current.room.type)}</KeyValue>
                <KeyValue label={t("Floor")}>{current.room.floor}</KeyValue>
                <KeyValue label={t("Building")}>{t(current.room.building)}</KeyValue>
              </div>
            </div>

            {current.occupant ? (
              <>
                <div className="border-t border-line pt-4">
                  <h3 className="mb-1 text-[14px] font-semibold">{t("Occupant")}</h3>
                  <KeyValue label={t("Name")}>
                    <Link href={`/shiftcomply-demo/staff/${current.occupant.id}`} className="text-primary hover:underline">
                      {current.occupant.name}
                    </Link>
                  </KeyValue>
                  <KeyValue label={t("Role")}>{t(current.occupant.role)}</KeyValue>
                  <KeyValue label={t("Contract ends")}>{fmt(current.occupant.contract.end)}</KeyValue>
                  <KeyValue label={t("Checkout")}>{fmt(current.occupant.checkout)}</KeyValue>
                </div>

                {current.status === "overdue" && (
                  <p className="rounded-md bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
                    {t("This employee's contract has ended. Check them out, or renew the contract to keep the room.")}
                  </p>
                )}

                <div className="border-t border-line pt-4">
                  <h3 className="mb-3 text-[14px] font-semibold">{t("Change checkout date")}</h3>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className={inputClass}
                      value={newCheckout}
                      onChange={(e) => setNewCheckout(e.target.value)}
                    />
                    <Button
                      disabled={!newCheckout}
                      onClick={() => {
                        extendStay(current.occupant!.id, newCheckout);
                        setNewCheckout("");
                      }}
                    >
                      {t("Save")}
                    </Button>
                  </div>
                  {newCheckout && current.occupant.contract.end && newCheckout > current.occupant.contract.end && (
                    <p className="mt-2 rounded-md bg-warning-soft px-3 py-2 text-[13px] text-warning">
                      {t(
                        "This is after the contract ends on {date}. Renew the contract, or make sure a housing extension is agreed in writing.",
                        { date: fmt(current.occupant.contract.end) },
                      )}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                  <Button variant="primary" onClick={() => setRenewId(current.occupant!.id)}>
                    {t("Renew contract")}
                  </Button>
                  <Button variant="danger" onClick={() => checkOut(current.room.id)}>
                    {t("Check out")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="border-t border-line pt-4">
                <p className="mb-3 text-[13px] text-muted">{t("This room is available.")}</p>
                {canEdit && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" onClick={() => setAssignFor(current.room.id)}>
                      {t("Assign someone")}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={async () => {
                        await deleteRoom(current.room.id);
                        setOpenRoom(null);
                      }}
                    >
                      {t("Remove room")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>

      {assignFor !== undefined && (
        <AssignRoomModal
          open
          roomId={assignFor}
          onClose={() => setAssignFor(undefined)}
          onAddRoom={() => setAddingRoom(true)}
        />
      )}
      {addingRoom && <AddRoomModal open onClose={() => setAddingRoom(false)} initialMode={rooms.length ? "one" : "many"} />}
      {renewId && <RenewContractModal open employeeId={renewId} onClose={() => setRenewId(null)} />}
    </>
  );
}
