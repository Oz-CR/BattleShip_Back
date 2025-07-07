/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const FindGamesController = () => import('../app/controllers/find_games_controller.js')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .group(() => {
    router.post('/register', '#controllers/auth_controller.register')
    router.post('/login', '#controllers/auth_controller.login')
    router.post('/logout', '#controllers/auth_controller.logout')
  })
  .prefix('/api/auth')

router
  .group(() => {
    router.get('/partidas/disponibilad', [FindGamesController, 'getGames'])
    router.post('/createRoom', [FindGamesController, 'createGame'])
    router.post('/join/player2', [FindGamesController, 'joinGame']).middleware(middleware.auth())
  })
  .prefix('/api')

router
  .group(() => {
    router.get('/profile', '#controllers/profiles_controller.show')
    router.put('/profile', '#controllers/profiles_controller.update')
    router.delete('/profile', '#controllers/profiles_controller.destroy')
    router.get('/profile/stats', '#controllers/profiles_controller.getStats')
  })
  .prefix('/api')
  .middleware(middleware.auth())
