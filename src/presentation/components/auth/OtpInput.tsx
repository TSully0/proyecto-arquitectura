import { useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from "react";

interface OtpInputProps {
  length?: number;
  onChange: (code: string) => void;
}

export function OtpInput({
  length = 6,
  onChange
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(
    Array(length).fill("")
  );

  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (next: string[]) => {
    setDigits(next);
    onChange(next.join(""));
  };

  const focusAt = (index: number) => {
    const safeIndex = Math.min(
      Math.max(index, 0),
      length - 1
    );

    refs.current[safeIndex]?.focus();
  };

  const fillFrom = (start: number, text: string) => {
    const onlyDigits = text.replace(/\D/g, "");

    if (!onlyDigits) return;

    const next = [...digits];
    let position = start;

    for (const char of onlyDigits) {
      if (position >= length) break;

      next[position] = char;
      position++;
    }

    update(next);
    focusAt(position);
  };

  const handleChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value;

    if (!raw) {
      const next = [...digits];
      next[index] = "";
      update(next);
      return;
    }

    const onlyDigits = raw.replace(/\D/g, "");

    fillFrom(
      onlyDigits.length >= length ? 0 : index,
      onlyDigits
    );
  };

  const handleKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      e.preventDefault();

      const next = [...digits];
      next[index - 1] = "";

      update(next);
      focusAt(index - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (
    e: ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    fillFrom(0, e.clipboardData.getData("text"));
  };

  return (
    <div className="otp-group">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          className={`otp-input${digit ? " filled" : ""}`}
          type="text"
          inputMode="numeric"
          autoComplete={
            index === 0 ? "one-time-code" : "off"
          }
          aria-label={`Dígito ${index + 1} de ${length}`}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}