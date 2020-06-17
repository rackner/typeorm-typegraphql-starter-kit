export class LoadRelation {
  // ID of the originating entity
  public id: string;

  // Name of the relation
  public relation: string;

  // Whether or not to load one or many
  public loadMany?: boolean = false;
}
