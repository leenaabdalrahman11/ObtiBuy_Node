import express from 'express'
import cors from 'cors'
import initApp from './src/app.router.js'
import 'dotenv/config'

const app = express()
const PORT = process.env.PORT || 10000

app.use(express.json())

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://react-opti-buy-ocui.vercel.app'
    ],
    credentials: true
  })
)

initApp(app, express)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
