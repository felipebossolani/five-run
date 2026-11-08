import type { Player, Locale, Attribute } from "../domain/types";

const tags: Record<string, Record<Locale, string>> = {
  movement: { "pt-BR": "Arremesso em movimento", en: "Shooting on the move" },
  pick: { "pt-BR": "Criação no pick-and-roll", en: "Pick-and-roll creator" },
  midrange: { "pt-BR": "Pontuação de média distância", en: "Midrange scorer" },
  paint: { "pt-BR": "Força no garrafão", en: "Power in the paint" },
  rim: { "pt-BR": "Proteção do aro", en: "Rim protection" },
  shooting: {
    "pt-BR": "Arremesso de longa distância",
    en: "Long-range shooting",
  },
  finishing: { "pt-BR": "Ataque à cesta", en: "Attack the basket" },
  playmaking: { "pt-BR": "Criação e passe", en: "Creation and passing" },
  defense: { "pt-BR": "Pressão na defesa", en: "Defensive pressure" },
  rebounding: { "pt-BR": "Controle dos rebotes", en: "Control the boards" },
  athleticism: { "pt-BR": "Ataque em velocidade", en: "Speed in transition" },
};
export function playerTag(player: Player, locale: Locale): string {
  const style = (player.style?.en ?? player.description.en).toLowerCase();
  const match: [RegExp, string][] = [
    [/pick.and.roll/, "pick"],
    [/midrange|mid-range|pull.up/, "midrange"],
    [/rim.protect|shot.block/, "rim"],
    [/movement|off.ball|off-ball|on the move/, "movement"],
    [/post.scor|interior.scor|paint.scor|power in the paint/, "paint"],
  ];
  const identified = match.find(([pattern]) => pattern.test(style));
  const strongest = (Object.keys(player.attributes) as Attribute[]).sort(
    (a, b) => player.attributes[b] - player.attributes[a],
  )[0];
  return tags[identified?.[1] ?? strongest][locale];
}
