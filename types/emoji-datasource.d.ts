declare module 'emoji-datasource' {
  interface Emoji {
    unified: string;
    image: string;
    short_name: string;
    short_names: string[];
    skin_variations: Record<string, Emoji>;
  }
  const source: Emoji[];
  export default source;
}
