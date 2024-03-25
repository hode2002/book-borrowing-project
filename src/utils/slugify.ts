import slugify from 'slugify'

export const createSlug = (text: string) => {
  return slugify(text, {
    replacement: '-',
    lower: true,
    locale: 'vi',
    trim: true
  })
}
