import { describe, test, expect, beforeEach } from 'vitest'
import { pipe, object, string, minLength, maxLength, forward, partialCheck, type InferOutput } from 'valibot'
import { createValidator } from '../valibot'
import { model, type Model } from '../../lib/model'
import { flushPromises } from '@vue/test-utils'

const FormSchema = pipe(
  object({
    password: pipe(string(), minLength(6), maxLength(18)),
    confirmPassword: string()
  }),
  forward(
    partialCheck(
      [['password'], ['confirmPassword']],
      input => input.password === input.confirmPassword,
      'The two passwords do not match.'
    ),
    ['confirmPassword']
  )
)

type FormModel = InferOutput<typeof FormSchema>

const validator = createValidator(FormSchema)
let vm: Model<FormModel>

describe('valibot adapter', () => {
  beforeEach(() => {
    vm = model({ password: '123456', confirmPassword: '123456' }, { validator })
  })

  test('has no errors', async () => {
    const error = await vm.validate()
    expect(error).toBe(undefined)
  })

  test('has length error', async () => {
    vm('password').value = '123'
    const error = await vm('password').validate()
    expect(error).toEqual('Invalid length: Expected >=6 but received 3')
  })

  test('has match error', async () => {
    vm('confirmPassword').value = '1234567'
    const error = await vm('confirmPassword').validate()
    expect(error).toEqual('The two passwords do not match.')
  })

  test('make sure nested paths work', async () => {
    const vm = model({
      foo: { bar: '' }
    }, {
      validator: createValidator(object({
        foo: object({
          bar: pipe(string(), minLength(1))
        })
      }))
    })
    const error = await vm.validate()
    expect(error).toEqual({ 'foo.bar': 'Invalid length: Expected >=1 but received 0' })
  })

  test('validateOnMount', async () => {
    const vm = model({ password: '123456', confirmPassword: '123' }, { validator, validateOnMount: true })
    await flushPromises()
    expect(vm.errors).toEqual({ confirmPassword: 'The two passwords do not match.' })
  })
})
