# vue-observables

Knockout-like functional syntax for Vue.js. Observables use all of Vue's reactivity, therefore they can trigger template updates, watchers, etc.

#### `observable<T>(value?: T)`

```ts
import { observable } from 'vue-observables'

const foo = observable(1)
console.log(foo()) // 1

foo(2)
console.log(foo()) // 2
```

#### `observableArray<T>(value: T[] = T[])`

Technically not needed, as Vue tracks deep reactivity for refs, but is provided for symmetry with Knockout.

```ts
import { observableArray } from 'vue-observables'

const foo = observableArray([1])
console.log(foo()) // [1]

foo().push(2)
console.log(foo()) // [1, 2]
```

#### `computed(getter [, debugOptions ])`

```ts
import { computed } from 'vue-observables'
// ...
const foo = computed(() => bar())
```

#### `computed(options [, debugOptions ])`

A computed observable.

`options`


| function        | description            |
| ----------------- | ------------------------ |
| `read` / `get`  | getter function        |
| `write` / `set` | (opt) setter function  |
| `owner`         | (opt) context of`this` |
