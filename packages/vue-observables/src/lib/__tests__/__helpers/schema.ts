import { object, string, number, array } from 'valibot'

export const schema = object({
  name: string(),
  age: number(),
  address: object({
    city: string(),
    state: string()
  }),
  destinations: array(object({
    place: number()
  }))
})
