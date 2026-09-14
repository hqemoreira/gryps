import { permanentRedirect } from "next/navigation";

/** Public research portfolio lives at /research. Keep /signatures for legacy map deep-links. */
export default function SignaturesIndexRedirect() {
  permanentRedirect("/research");
}
