export type CartLine = {
  dish_id: number;
  name: string;
  price: number;
  quantity: number;
  photo_path?: string | null;
};

export type CartItemInput = {
  dish_id: number;
  name: string;
  price: number;
  photo_path?: string | null;
};
