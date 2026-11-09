// Card grids: people cards need ~360px; project and event cards (with a cover) read fine from 300px.
export const CARD_GRID = {
  wide: 'grid-cols-[repeat(auto-fit,minmax(min(360px,100%),1fr))]',
  narrow: 'grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))]',
};

export type CardSize = keyof typeof CARD_GRID;
