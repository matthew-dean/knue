/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as O from 'vue-observables'
import type {
  KnuePlugins,
  GetReturn,
  KnueConstructor
} from './types'

export type KnueType<Plugins extends KnuePlugins> = ReturnType<typeof Knue<Plugins>>

function Knue<const Plugins extends KnuePlugins>(plugins?: Plugins) {
  let returnVal = O
  if (plugins) {
    for (const plugin of plugins) {
      returnVal = plugin.init(returnVal)
    }
  }
  return returnVal as GetReturn<typeof returnVal, Plugins>
}

const VueKnockout = Knue as unknown as KnueConstructor

export { VueKnockout as Knue }
