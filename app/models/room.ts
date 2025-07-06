import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Room extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column({ columnName: 'player1_id' })
  declare player1Id: number

  @column({ columnName: 'player2_id' })
  declare player2Id: number | null

  @column()
  declare status: 'waiting' | 'playing' | 'finished'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relaciones
  @belongsTo(() => User, {
    foreignKey: 'player1Id',
  })
  declare player1: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'player2Id',
  })
  declare player2: BelongsTo<typeof User>
}
