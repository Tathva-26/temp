"use client";
import { useEffect, useState } from "react";
import { getReferralCode } from "@/lib/referral";

/**
 * Referral code input for the checkout dialogs.
 *
 * Prefilled from a code captured off a `?referral_code=` link, but editable, so
 * someone who was handed a code by hand can enter it too. It is read when the
 * dialog opens rather than on mount: the dialogs mount with the page, which can
 * be before the landing-URL code has been written to storage.
 *
 * @returns `[code, field]` — the current value, and the element to render.
 */
export default function useReferralCodeField(isOpen) {
  const [code, setCode] = useState("");

  useEffect(() => {
    if (isOpen) setCode(getReferralCode() ?? "");
  }, [isOpen]);

  const field = (
    <div>
      <label
        htmlFor="referral-code"
        className="block text-sm text-gray-700 mb-1"
      >
        Referral code <span className="text-gray-400">(optional)</span>
      </label>
      <input
        id="referral-code"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={32}
        placeholder="e.g. AB12CD"
        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-black text-sm focus:outline-none focus:border-gray-900"
      />
    </div>
  );

  return [code, field];
}
