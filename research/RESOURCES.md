
- https://arewedecentralizedyet.online/

- https://lucag.dev/blog/cosmos-peers-decentralization

- MigaLabs
    - https://www.migalabs.io/docs
    - Adam got [API](https://www.migalabs.io/api-access) working, about 7600 nodes counted in country buckets

        [https://www.migalabs.io/docs/Consensus Layer Nodes/v1/nodes/consensus/all/geographical_distribution/get](https://www.migalabs.io/docs/Consensus%20Layer%20Nodes/v1/nodes/consensus/all/geographical_distribution/get)

        ```jsx
        curl -X GET "https://www.migalabs.io/api/eth/v1/nodes/consensus/all/geographical_distribution" \
          -H "X-Api-Key: U2JLclR4ejFHQ1dmV1U0VzlvdUdTRWUwNFp3Zw" > geo.json
        jq < geo.json
        cat geo.json | jq '.[0].data|map(.node_count)|add'
        ```

- Alchemy: provides IP addresses of ~530 beacon chain peers

    ```jsx
    curl -X 'GET' 'https://eth-mainnetbeacon.g.alchemy.com/v2/SkqSfZt_MMxElKFP64Y4O3Zg67_4nuwn/eth/v1/node/peers' -H 'accept: application/json' >| peers.json
    cat peers.json| jq -r '.data|map(.last_seen_p2p_address)[]|@text' |\
      sed 's,/ip4/,,; s,/.*,,' >| p2p.txt
    ```

- ethPandaOps
  - contributoors voluntarily run xatu sidecar on their nodes
    https://lab.ethpandaops.io/xatu/geographical-checklist
  - xatu uses GeoIP
  - https://lab.ethpandaops.io/ethereum/entities shows "affiliations"
    of nodes
  - https://ethpandaops.io/docs/tooling/cbt/
  - CBT (Clickhouse Build Tool) powers data transformation in the ethPandaOps infrastructure:
    - Xatu Data: Transforms raw Xatu network data into analytics tables
    - The Lab: Provides transformed data for visualization and analysis
    - Public Data: Powers the public datasets available to the community

- https://ethernodes.org/
  - Seems like a black box

- https://etherscan.io/nodetracker
  - Exactly the data we want but only 5000 rows available for CSV export
  - No API
