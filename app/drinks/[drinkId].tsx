import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function DrinkDetailScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Drink detail" />
      <EmptyState title="Connect /api/drinks/:drinkId" />
    </ScrollScreen>
  );
}
