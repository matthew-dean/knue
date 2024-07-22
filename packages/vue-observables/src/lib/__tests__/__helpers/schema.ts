import { object, string, number } from 'valibot'

export const schema = object({
  name: string(),
  age: number(),
  address: object({
    city: string(),
    state: string()
  })
})
