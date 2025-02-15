type Brightness = 'light' | 'dark' | 'normal';

const generatedHex: Set<string> = new Set();

export function genHex(brightness: Brightness = 'normal') {
  const brightnessScheme: Record<Brightness, string> = {
    light: '89ABCDEF',
    dark: '12345678',
    normal: '123456789ABCDEF',
  };

  const hexRange = brightnessScheme[brightness] ?? brightnessScheme.normal;
  const newHex = [...Array(6)]
    .map(() => hexRange[Math.floor(Math.random() * hexRange.length)])
    .join('');

  if (generatedHex.has(newHex)) {
    return genHex();
  }

  generatedHex.add(newHex);
  return `#${newHex}`;
}
