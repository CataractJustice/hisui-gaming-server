# hisui-gaming-server
`WebSocket game server with compact protocol that can broadcast and store player and game states.`

## Protocol
### Server-to-Client
All server-to-client packets start with a single byte that specifies its type
The types are

| Value | Description |
|---|---|
| 0 | Player connected |
| 1 | Player joined current map |
| 2 | Player disconnected or left current map |
| 3 | Player data packet |
| 4 | Id of your player |

Player connected/joined/disconnected/"my id" packets
|Type|Byte offset|Description|
|---|---|---|
|UInt8|0|Packet type|
|UInt32|1|Player id|

Player data packet structure
|Type|Byte offset|Description|
|---|---|---|
|UInt8|0|Packet type|
|UInt8|1|Broadcast scope|
|UInt32|2|Data owner id|
|UInt16|6|Data slot|
|Blob|8|Stored data|


### Client-to-Server packets
All client-to-server packets start with a single byte that specify its type
The types are

| Value | Description |
|---|---|
| 0 | Switch to another map |
| 1 | Broadcast/Store data |

Connect to another map
|Type|Byte offset|Description|
|---|---|---|
|UInt8|0|Packet type|
|UInt16|1|Map number|

Broadcast/Store data

|Type|Byte offset|Description|
|---|---|---|
|UInt8|0|Packet type|
|UInt8|1|Flags mask|
|UInt16|2|Data slot|
|Blob|4|Any data that should be stored/broadcasted|

Possible flags that client can use are
|Flag description|Flag mask byte|
|---|---|
|Broadcast data to players in the same map|0|
|Broadcast data to players playing the same game|1|
|Broadcast data to whole server|2|
|Store data for this player|3|
|Store data for current map|4|
|Store data for current game|5|
|Store data for current server|6|

## How to run
`node main`
