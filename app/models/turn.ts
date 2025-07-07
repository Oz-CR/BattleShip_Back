import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Game from './game.js'

export default class Turn extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'game_id' })
  declare gameId: number

  @column({ columnName: 'player_id' })
  declare playerId: number

  @column()
  declare positionX: number

  @column()
  declare positionY: number

  @column()
  declare hit: boolean

  @column()
  declare turnNumber: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relaciones
  @belongsTo(() => Game, {
    foreignKey: 'gameId',
  })
  declare game: BelongsTo<typeof Game>

  @belongsTo(() => User, {
    foreignKey: 'playerId',
  })
  declare player: BelongsTo<typeof User>
}
