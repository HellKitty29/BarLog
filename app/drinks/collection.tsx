import { Text, StyleSheet } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { AppHeader } from "@/components/common/AppHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingView } from "@/components/common/LoadingView";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { useDrinkCollectionQuery } from "@/features/drinks/drinks.queries";
import { colors, typography } from "@/theme";

export default function DrinkCollectionScreen() {
  const collection = useDrinkCollectionQuery();

  return (
    <ScrollScreen>
      <AppHeader title="Cocktail collection" />
      {collection.isLoading ? <LoadingView /> : null}
      {collection.isError ? <ErrorState message={collection.error.message} /> : null}
      {collection.data?.map((drink) => (
        <AppCard key={drink.id}>
          <Text style={styles.title}>{drink.name}</Text>
          <Text style={styles.body}>{drink.category}</Text>
        </AppCard>
      ))}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.heading,
    color: colors.text
  },
  body: {
    ...typography.body,
    color: colors.textMuted
  }
});
