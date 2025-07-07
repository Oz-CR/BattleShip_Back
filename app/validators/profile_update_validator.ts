import vine from '@vinejs/vine'

export const profileUpdateValidator = vine.compile(
  vine.object({
    fullName: vine.string().optional(),
    email: vine.string().email().optional(),
    password: vine.string().optional(),
  })
)
