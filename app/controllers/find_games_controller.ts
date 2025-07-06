import Room from '#models/room'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

export default class FindGamesController {
  async getGames({ response }: HttpContext) {
    const rooms = await Room.query().where('status', 'waiting')

    return response.json(rooms)
  }

  async createGame({ request, response }: HttpContext) {
    const body = request.body()

    const game = await Room.create({
      name: body.name,
      player1Id: body.player1Id,
      player2Id: null,
      status: 'waiting',
    })

    return response.json(game)
  }

  async joinGame({ request, response, auth }: HttpContext) {
    try {
      const userId = auth.user?.id
      const { idgame } = request.only(['idgame'])

      if (!userId) {
        return response.status(401).json({ error: 'Usuario no autenticado' })
      }

      if (!idgame || isNaN(Number(idgame))) {
        return response.status(400).json({ error: 'ID de juego inválido' })
      }

      const game = await Room.findOrFail(idgame)

      if (game.player1Id === userId) {
        return response.status(403).json({
          error: 'No puedes unirte a tu propia partida',
        })
      }

      if (game.player2Id !== null) {
        return response.status(403).json({
          error: 'La partida ya tiene un segundo jugador',
        })
      }

      await game
        .merge({
          player2Id: userId,
          status: 'playing'
        })
        .save()

      // Initialize the game when second player joins
      //  await game.initializeGame()

      return response.json({
        success: true,
        message: 'Unido a la partida exitosamente',
        game: {
          id: game.id,
          name: game.name,
          status: game.status
        }
      })
    } catch (error) {
      logger.error('Error en joinGame:', error)
      return response.status(500).json({
        error: 'Error interno del servidor',
        exception: error.message,
      })
    }
  }
}
