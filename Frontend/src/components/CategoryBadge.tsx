import { Badge } from "@/components/ui/badge";
import { Music, Trophy, Theater, Palette, PartyPopper, Utensils } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface CategoryBadgeProps {
  name: string;
  icon?: string;
  active?: boolean;
  onClick?: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  music: Music,
  sports: Trophy,
  theater: Theater,
  arts: Palette,
  festivals: PartyPopper,
  food: Utensils,
};

export const CategoryBadge = ({ name, icon, active, onClick }: CategoryBadgeProps) => {
  const Icon = icon ? iconMap[icon.toLowerCase()] : null;

  return (
    <Badge
      onClick={onClick}
      className={`px-4 py-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
        active
          ? "bg-primary text-primary-foreground hover:bg-primary-hover"
          : "bg-muted text-muted-foreground hover:bg-muted-foreground/10"
      }`}
    >
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {name}
    </Badge>
  );
};
