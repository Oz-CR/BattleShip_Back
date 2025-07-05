import vine from '@vinejs/vine'

const onlyLettersAndSpaces = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/

export const registerValidator = vine.compile(
    vine.object({
        full_name: vine.string().trim().minLength(3).maxLength(30).regex(onlyLettersAndSpaces),
        email: vine.string().trim().email(),
        password: vine.string().minLength(6).maxLength(20)
    })
)

export const loginValidator = vine.compile(
    vine.object({
        email: vine.string().trim().email(),
        password: vine.string().minLength(1)
    })
)