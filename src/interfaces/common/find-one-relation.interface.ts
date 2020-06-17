export abstract class FindOneRelation {
  public relation: string;

  public name: string;

  // Conditionals should be for backend only
  public conditional?: Conditional;
}

class Conditional {
  public attribute?: string = 'id';

  public value: string | boolean | number;
}
