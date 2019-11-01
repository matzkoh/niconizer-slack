declare module 'emoji-datasource' {
  export interface EmojiDatasource {
    unified: string
    image: string
    short_name: string
    short_names: string[]
    skin_variations?: Record<string, EmojiDatasource | undefined>
  }

  const source: EmojiDatasource[]
  export default source
}
