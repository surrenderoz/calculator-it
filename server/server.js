const express = require("express");
const app = express();
const bodyparser = require("body-parser")

const getCalculation = require("./service/index");

const cors = require("cors");
const option = {
    // origin: "http://localhost:3000/"
}
app.use(express.json())

app.use(cors())



app.post('/', async (req, res) => {
    try {
        // const {data} = req.body;
        const data = req.body;
        console.log(req.body, "body");

        let ress = await getCalculation.getCalculation(data)

        // console.log(JSON.parse(res), "daaa");
        console.log("serfer", ress);
        return res.json({ 
            message: 'success',
            data: ress
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message: "send"
        })
    }
})

app.listen(3070, ()=> {
    console.log("running");
})