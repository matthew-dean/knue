# Knue - Knockout, powered by Vue

(WARNING: Not production ready, still in alpha. Open issues if you have a particular Knockout API you need.)

Drop-in replacement for much of the Knockout API, but backed with Vue. Useful for migrating from a Knockout codebase when refactoring to Vue.

#### ko

Root object

```ts
import Knue from 'knue'

const ko = new Knue()
```

API

<details>
  <summary>✅ Observables (v1.0.0-alpha.1)</summary>

  **Observable**

  ```ts
  const ko = new Knue()

  const foo = ko.observable(1)
  ```

  Or, methods can be destructured, like:

  ```ts
  const { observable } = new Knue()

  const foo = observable(1)
  ```

  **ObservableArray**

  ```ts
  const foo = ko.observableArray<string>()
  console.log(foo()) // []
  ```


  **Computed**

  ```ts
  const co1 = ko.computed(() => 1)
  const co2 = computed(() => co1() + 1)
  console.log(co1()) // 1
  console.log(co2()) // 2
  ```
</details>

