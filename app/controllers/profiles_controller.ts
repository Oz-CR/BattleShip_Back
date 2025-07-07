import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Game from '#models/game'
import Room from '#models/room'
import Turn from '#models/turn'
import { profileUpdateValidator } from '#validators/profile_update_validator'
import hash from '@adonisjs/core/services/hash'

export default class ProfilesController {
  /**
   * Actualizar perfil del usuario
   */
  async update({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const payload = await request.validateUsing(profileUpdateValidator)
      
      // Actualizar datos del usuario
      if (payload.fullName) {
        user.fullName = payload.fullName
      }
      
      if (payload.email && payload.email !== user.email) {
        user.email = payload.email
      }
      
      if (payload.password) {
        user.password = await hash.make(payload.password)
      }
      
      await user.save()
      
      return response.json({
        message: 'Perfil actualizado exitosamente',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al actualizar perfil',
        error: error.message,
      })
    }
  }

  /**
   * Eliminar cuenta del usuario
   */
  async destroy({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const { password } = request.only(['password'])
      
      if (!password) {
        return response.badRequest({
          message: 'La contraseña es requerida',
        })
      }
      
      // Verificar contraseña actual
      const isValidPassword = await hash.verify(user.password, password)
      
      if (!isValidPassword) {
        return response.badRequest({
          message: 'Contraseña incorrecta',
        })
      }
      
      await user.delete()
      
      return response.json({
        message: 'Cuenta eliminada exitosamente',
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al eliminar cuenta',
        error: error.message,
      })
    }
  }

  /**
   * Obtener estadísticas del jugador
   */
  async getStats({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      
      // Obtener todas las rooms donde el usuario ha participado
      const userRooms = await Room.query()
        .where('player1Id', user.id)
        .orWhere('player2Id', user.id)
        .preload('player1', (query) => {
          query.select('id', 'fullName', 'email')
        })
        .preload('player2', (query) => {
          query.select('id', 'fullName', 'email')
        })
        .orderBy('createdAt', 'desc')
      
      // Obtener juegos con más detalles
      const gameStats = await Promise.all(
        userRooms.map(async (room) => {
          const game = await Game.query()
            .where('roomId', room.id)
            .preload('winner', (query) => {
              query.select('id', 'fullName', 'email')
            })
            .first()
          
          // Obtener turnos del usuario en este juego
          const userTurns = game
            ? await Turn.query()
                .where('gameId', game.id)
                .where('playerId', user.id)
                .orderBy('turnNumber', 'asc')
            : []
          
          // Obtener todos los turnos del juego para contar ataques totales
          const allTurns = game
            ? await Turn.query()
                .where('gameId', game.id)
                .orderBy('turnNumber', 'asc')
            : []
          
          const opponent = room.player1Id === user.id ? room.player2 : room.player1
          const opponentTurns = allTurns.filter(
            (turn) => turn.playerId !== user.id
          )
          
          return {
            id: game?.id || null,
            roomName: room.name,
            opponent: opponent ? opponent.fullName || opponent.email : 'Unknown',
            winner: game?.winner ? game.winner.fullName || game.winner.email : 'None',
            userShips: game?.player1InitialBoard || game?.player2InitialBoard ? 1 : 0, // Simplificado
            userAttacks: userTurns.length,
            opponentAttacks: opponentTurns.length,
            status: game?.status || room.status,
            hits: userTurns.filter((turn) => turn.hit).length,
            misses: userTurns.filter((turn) => !turn.hit).length,
            createdAt: room.createdAt,
          }
        })
      )
      
      // Calcular estadísticas generales
      const finishedGames = gameStats.filter(
        (game) => game.status === 'finished'
      )
      const gamesWon = finishedGames.filter(
        (game) => game.winner === (user.fullName || user.email)
      ).length
      const gamesLost = finishedGames.filter(
        (game) => game.winner !== 'None' && game.winner !== (user.fullName || user.email)
      ).length
      const totalGames = gameStats.length
      const totalAttacks = gameStats.reduce((sum, game) => sum + game.userAttacks, 0)
      const totalHits = gameStats.reduce((sum, game) => sum + game.hits, 0)
      const accuracy = totalAttacks > 0 ? (totalHits / totalAttacks) * 100 : 0
      
      return response.json({
        user: {
          id: user.id,
          name: user.fullName || user.email,
          email: user.email,
        },
        stats: {
          gamesWon,
          gamesLost,
          totalGames,
          winRate: totalGames > 0 ? (gamesWon / totalGames) * 100 : 0,
          totalAttacks,
          totalHits,
          accuracy: Math.round(accuracy * 100) / 100,
        },
        games: gameStats,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al obtener estadísticas',
        error: error.message,
      })
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async show({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      
      return response.json({
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al obtener perfil',
        error: error.message,
      })
    }
  }
}
