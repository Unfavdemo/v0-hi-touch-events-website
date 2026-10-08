import { Button } from "@/components/network/ui/Button";
import {
  blockVendor,
  favoriteVendor,
  unblockVendor,
  unfavoriteVendor,
} from "@/lib/network/roster-actions";

export function RosterButtons({
  vendorId,
  favorite,
  blocked,
}: {
  vendorId: string;
  favorite: boolean;
  blocked: boolean;
}) {
  if (blocked) {
    return (
      <form action={unblockVendor.bind(null, vendorId)}>
        <Button type="submit" size="sm" variant="ghost">
          Unblock
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <form action={(favorite ? unfavoriteVendor : favoriteVendor).bind(null, vendorId)}>
        <Button type="submit" size="sm" variant={favorite ? "gold" : "outline"}>
          {favorite ? "Favorited" : "Favorite"}
        </Button>
      </form>
      <form action={blockVendor.bind(null, vendorId)}>
        <Button type="submit" size="sm" variant="ghost">
          Block
        </Button>
      </form>
    </div>
  );
}
