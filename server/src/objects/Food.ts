import Food from '../types/objects/Food';

export default function createFood(x: number, y: number, size: number): Food {
  const food: Food = {
    position: {
      x,
      y
    },
    size
  };

  return food
}



