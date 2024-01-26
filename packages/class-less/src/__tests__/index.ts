import { describe, test, expect, vi } from 'vitest'
import {
  create
} from '..'

describe('basic API', () => {
  test('create', () => {
    const MyClass = create((id: string) => {
      return { id }
    })
    console.log(MyClass)
    const bar = new MyClass('bar')
    expect(bar.id).toBe('bar')
    expect(bar instanceof MyClass).toBe(true)
  })
})
