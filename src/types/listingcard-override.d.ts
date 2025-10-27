declare module "@/components/listing/ListingCard" {
  import * as React from "react";
  export type Props = { item?: any; listing?: any; hrefBase?: string };
  const ListingCard: React.FC<Props>;
  export default ListingCard;
}
