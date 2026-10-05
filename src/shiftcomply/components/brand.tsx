import Image from "next/image";

/**
 * ShiftComply product logo for the dark blue header:
 * the Advisorly mark with "ShiftComply" and "by Advisorly" underneath.
 */
export function BrandLogo() {
  return (
    <span className="flex items-center gap-2">
      <Image
        src="/shiftcomply/advisorly-mark.png"
        alt="Advisorly"
        width={23}
        height={20}
        priority
        className="h-5 w-auto shrink-0"
      />
      <span className="flex flex-col leading-none">
        <span className="text-[16px] font-semibold tracking-[-0.01em] text-white">ShiftComply</span>
        <span className="mt-[3px] text-[11px] font-normal text-[#9fb1cc]">by Advisorly</span>
      </span>
    </span>
  );
}
