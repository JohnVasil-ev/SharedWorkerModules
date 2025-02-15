export const getCorrectNameExpr = (name: string, baseName: string) =>
  name.match(`^${baseName}(?<index>\\s\\d+)?$`);
