"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div
      className="flex-1 flex items-center justify-center min-h-[60vh] w-full"
      style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif" }}
    >
      <div className="flex flex-col items-center text-center px-6 max-w-[480px]">
        <div className="w-[64px] h-[64px] rounded-full bg-red-50 flex items-center justify-center mb-[24px]">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="#ef4444" strokeWidth="2" />
            <path
              d="M14 8v7"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="14" cy="20" r="1.5" fill="#ef4444" />
          </svg>
        </div>
        <h1 className="text-[24px] font-[500] text-[#1E1A1A] mb-[10px]">
          Something went wrong
        </h1>
        <p className="text-[15px] text-[#1E1A1A]/60 leading-[1.6] mb-[24px]">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-[24px] py-[10px] rounded-[8px] bg-[#EE6723] text-white text-[14px] font-medium hover:bg-[#d95a1e] transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
