# ideas

```vue
<script setup lang="ts">
import MyViewModel from './MyViewModel'

defineViewModel(MyViewModel)
</script>
<!-- or? -->
<script src="./MyViewModel" />

<script lang="ts">
export default class MyViewModel extends ViewModel {
}
</script>
```
```ts
import { ViewModel, observable } from '~/knue.config'
import MyComponent from './component.vue'

export default class MyViewModel extends ViewModel {
  num = observable(1)

  static components = {
    MyComponent
  }
  static props: {
    name: string
    age: number
  }
  static emits: {
    change(): void
  }
}
```