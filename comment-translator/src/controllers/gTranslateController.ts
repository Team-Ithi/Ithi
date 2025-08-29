// const translate = require('google-translate-api')
import { translate } from '@vitalets/google-translate-api'


export const translation = async (text: string, language: string) => {
    try {
        const result = await translate(text, { to: language })

    

        console.log(result)
    } catch (err) {
        console.error('Translation Failed: ', err)
        throw err
    }
}