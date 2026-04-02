import {assertNotNull} from '@subsquid/util-internal'
import {
    BlockHeader,
    DataHandlerContext,
    EvmBatchProcessor,
    EvmBatchProcessorFields,
    Log as _Log,
    Transaction as _Transaction,
} from '@subsquid/evm-processor'
import pino from 'pino'

import { createPinoSink, setRootSink } from "@subsquid/logger";

setRootSink(
  createPinoSink(
    pino({ transport: { targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true
        }  
      },
      {
        target: 'pino-datadog-transport',
        options: { // typed as any - please follow the structure below 
          ddClientConf: {
            authMethods: {
              apiKeyAuth: process.env.DATADOG_API_KEY!,
            },
          },
          ddServerConf: {
            site: process.env.DATADOG_SITE!,
          },
          ...(process.env.DATADOG_TAGS && {
            ddtags: process.env.DATADOG_TAGS,
          }),
          ddsource: "nodejs",
          service: process.env.DATADOG_SERVICE || "squid-evm-template",
        }
      }
    ]}}),
  ),
);

export const processor = new EvmBatchProcessor()
  // Lookup archive by the network name in Subsquid registry
  // See https://docs.subsquid.io/evm-indexing/supported-networks/
  .setGateway('https://v2.archive.subsquid.io/network/ethereum-mainnet')
  // Chain RPC endpoint is required for
  //  - indexing unfinalized blocks https://docs.subsquid.io/basics/unfinalized-blocks/
  //  - querying the contract state https://docs.subsquid.io/evm-indexing/query-state/
  .setRpcEndpoint({
    // Set the URL via .env for local runs or via secrets when deploying to Subsquid Cloud
    // https://docs.subsquid.io/deploy-squid/env-variables/
    url: assertNotNull(process.env.RPC_ETH_HTTP, 'No RPC endpoint supplied'),
    // More RPC connection options at https://docs.subsquid.io/evm-indexing/configuration/initialization/#set-data-source
    rateLimit: 10
  })
  .setFinalityConfirmation(75)
  .setFields({
    transaction: {
      from: true,
      value: true,
      hash: true,
    },
  })
  .setBlockRange({
    from: 0,
  })
  .addTransaction({
    to: ['0x0000000000000000000000000000000000000000'],
  })

export type Fields = EvmBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>
