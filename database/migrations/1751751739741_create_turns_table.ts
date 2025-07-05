import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'turns'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('game_id').unsigned().notNullable().references('id').inTable('games').onDelete('CASCADE')
      table.integer('player_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('position_x').notNullable()
      table.integer('position_y').notNullable()
      table.boolean('hit').notNullable()
      table.integer('turn_number').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}