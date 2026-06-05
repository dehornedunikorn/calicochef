import happy from "@/assets/calico-happy.png";
import shocked from "@/assets/calico-shocked.png";
import sleepy from "@/assets/calico-sleepy.png";
import sad from "@/assets/calico-sad.png";
import smirk from "@/assets/calico-smirk.png";
import love from "@/assets/calico-love.png";

export type CalicoVariant = "happy" | "shocked" | "sleepy" | "sad" | "smirk" | "love";

const SRC: Record<CalicoVariant, string> = { happy, shocked, sleepy, sad, smirk, love };

export const CALICO_SCALE: CalicoVariant[] = ["sad", "shocked", "smirk", "happy", "love"];

export function CalicoCat({
  variant = "happy",
  size = 48,
  className = "",
}: {
  variant?: CalicoVariant;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={SRC[variant]}
      alt={`calico cat ${variant}`}
      loading="lazy"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`inline-block object-contain drop-shadow-[2px_3px_0_oklch(0.3_0.04_40_/_0.3)] ${className}`}
    />
  );
}
