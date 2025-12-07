// Seeded random number generator for deterministic data generation

export class SeededRandom {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  // Linear congruential generator
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 2 ** 32;
    return this.seed / 2 ** 32;
  }

  // Random integer between min (inclusive) and max (exclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  // Random float between min (inclusive) and max (exclusive)
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  // Random boolean with given probability
  nextBoolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  // Random element from array
  nextChoice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }

  // Shuffle array (Fisher-Yates)
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Weighted random choice
  weightedChoice<T>(items: Array<{ item: T; weight: number }>): T {
    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
    let random = this.next() * totalWeight;
    for (const { item, weight } of items) {
      random -= weight;
      if (random <= 0) return item;
    }
    return items[items.length - 1].item;
  }
}






