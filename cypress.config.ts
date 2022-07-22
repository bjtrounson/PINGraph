import { defineConfig } from 'cypress'

export default defineConfig({
    projectId: "wnwrko",
    e2e: {
        baseUrl: 'http://localhost:1234',
        supportFile: false,
    }
})