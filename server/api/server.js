
import express  from 'express'
import { chatBot } from '../chatBot.js';
import "../config.js" //for env
import cors from 'cors'



const app = express();
const port = process.env.PORT;

app.use(cors())
app.use(express.json())

// getting chatBot
app.get('/', (req, res) => {
  res.send('Hello from server');
});

app.post('/api/chat',async (req,res)=>{
  // console.log("full body",req.body)
  const {message ,conversationId} = req.body
  //* adding validation 
 if(!message || !conversationId){
   res.status(400).json({message:'All fields are reqired'})
   return
 }


  // console.log('Message', message)
  const result = await chatBot(message, conversationId)
  res.json({message:result})
})
/* 
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); */

export default app