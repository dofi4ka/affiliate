import { z } from "zod"
import { createEnv } from "@t3-oss/env-nextjs"

export const env = createEnv({
    client: {
        NEXT_PUBLIC_API_URL: z.string().url().default("https://affiliate-api.dofi4ka.ru"),
    }
})