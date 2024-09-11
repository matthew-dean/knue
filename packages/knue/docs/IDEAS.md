# ideas

```vue
<script setup lang="ts">
import MyViewModel from './MyViewModel'

defineViewModel(MyViewModel)
</script>
<!-- or? -->
<script viewmodel src="./MyViewModel" />

<script lang="ts">
export default class MyViewModel extends ViewModel {
}
</script>

<template>
  {#with obj}
    {#for foo [bar]}
      {#if cond}
        <span value={}>{personName}</span>
      {/if}
      {#elseif cond}
        
      {/elseif}
    {/for}
  {/with}
</template>
```
```ts
import { ViewModel, observable } from '~/knue.config'
import MyComponent from './component.vue'

interface Props {
  name: string
  age: number
}

export default class MyViewModel extends ViewModel<Props> {
  num = observable(1)

  static emits: {
    change(): void
  }
}
```