

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img 
        src="/logo.png" 
        alt="Advisorly" 
        className="h-12 md:h-14 object-contain scale-[1.8] md:scale-[2.2] origin-left" 
      />
    </div>
  );
}
