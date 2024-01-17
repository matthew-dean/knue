/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as O from 'vue-observables'
import type {
  KnuePlugins,
  GetReturn
} from './types'

type KnueType<Opts extends KnuePlugins> = ReturnType<typeof Knue<Opts>>

function Knue<const Plugins extends KnuePlugins>(plugins?: Plugins) {
  let returnVal = O
  if (plugins) {
    for (const plugin of plugins) {
      // returnVal[key] = value
      // const module = opts[key]
      returnVal = plugin.init(returnVal)
    }
  }
  // as GetReturn<typeof returnVal, Plugins>
  return returnVal as GetReturn<typeof returnVal, Plugins>
}

const VueKnockout = Knue as unknown as {
  <Opts extends KnuePlugins>(opts?: Opts): KnueType<Opts>
  new<Opts extends KnuePlugins>(opts?: Opts): KnueType<Opts>
}

export { VueKnockout as Knue }
