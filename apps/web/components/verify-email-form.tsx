"use client";

import { emailVerification } from "@/app/(auth)/verify-email/actions/verify-email";
import { useFormState, useFormStatus } from "react-dom";
import { OTPInput, SlotProps } from "input-otp";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function VerifyEmailForm({ code }: { code: string }) {
  const onAction = async () => {
    if (code) {
      const response = await emailVerification({ code: code as string });

      if (response) {
        if (response.error) {
          toast.error(response.error);
        }
      }
    }
  };

  const [state, dispatch] = useFormState(onAction, undefined);

  return (
    <form action={dispatch}>
      <OTPInput
        maxLength={8}
        containerClassName="group flex items-center has-[:disabled]:opacity-30"
        render={({ slots }) => (
          <>
            <div className="flex">
              {slots.slice(0, 4).map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </div>

            <FakeDash />

            <div className="flex">
              {slots.slice(4).map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </div>
          </>
        )}
      />

      <SubmitButton />
    </form>
  );
}

const SubmitButton = () => {
  const status = useFormStatus();

  return (
    <button disabled={status.pending} type="submit">
      Verify Email
    </button>
  );
};

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "relative w-10 h-14 text-[2rem]",
        "flex items-center justify-center",
        "transition-all duration-300",
        "border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md",
        "group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20",
        "outline outline-0 outline-accent-foreground/20",
        { "outline-4 outline-accent-foreground": props.isActive }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  );
}

function FakeCaret() {
  return (
    <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
      <div className="w-px h-8 bg-white" />
    </div>
  );
}

// Inspired by Stripe's MFA input.
function FakeDash() {
  return (
    <div className="flex w-10 justify-center items-center">
      <div className="w-3 h-1 rounded-full bg-border" />
    </div>
  );
}
