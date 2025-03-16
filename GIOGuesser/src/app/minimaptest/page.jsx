import MiniMap from "@/components/showinglocationandguesspage/mini";
import PanoImg from "@/components/showinglocationandguesspage/panaromicmg";
import Timer from "@/components/Timer/timer";

export default function HomePage() {
  return (
    <div className="relative">
      <PanoImg />
      <MiniMap/>
    </div>
  );
}
