# Knue - Knockout, powered by Vue

(WARNING: Not production ready, still in alpha. Open issues if you have a particular Knockout API you need.)

Drop-in replacement for much of the Knockout API, but backed with Vue. Useful for migrating from a Knockout codebase when refactoring to Vue.

#### ko

Root object

```ts
import ko from 'knue'
```

API

<details>
  <summary>✅ Observables (v1.0.0-alpha.1)</summary>

  **Observable**

  ```ts
  import ko from 'knue'

  const foo = ko.observable(1)
  ```

  or:

  ```ts
  import { observable } from 'knue'

  const foo = observable(1)
  ```

  **ObservableArray**

  ```ts
  import ko from 'knue'

  const foo = ko.observableArray<string>()
  console.log(foo()) // []
  ```


  **Computed**

  ```ts
  import ko, { computed } from 'knue'

  const co1 = ko.computed(() => 1)
  const co2 = computed(() => co1() + 1)
  console.log(co1()) // 1
  console.log(co2()) // 2
  ```
</details>

