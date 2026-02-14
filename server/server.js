
import express  from 'express'
import { Generate } from './chatBot.js';
import "./config.js" //for env
import cors from 'cors'



const app = express();
const port = process.env.PORT;

app.use(cors())
app.use(express.json())

// getting chatBot
app.get('/', (req, res) => {
  res.send('Hello from server');
});

app.post('/chat',async (req,res)=>{
  console.log("full body",req.body)
  const {message} = req.body

  console.log('Message', message)
  const result = await Generate(message)
  res.json({message:result})
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
